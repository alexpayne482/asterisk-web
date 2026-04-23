import sys, os, time, threading, logging, ipaddress
import json, collections
from pathlib import Path

from .globals import _app_name
log = logging.getLogger(_app_name)

def ModulePath():
    import importlib.resources
    return importlib.resources.files(_app_name)

class Dict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.__getitem__
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

    def merge(self, merge_dct):
        if not merge_dct:
            return self
        for k, v in merge_dct.items():
            if (k in self and isinstance(self[k], Dict) and isinstance(merge_dct[k], Dict)):  #noqa
                self[k].merge(merge_dct[k])
            else:
                self[k] = merge_dct[k]
        return self

    def hasAttribute(self, attribute):
        return attribute in self and self[attribute] is not None

    def __str__(self):
        return json.dumps(self, default=str, indent=4)


class Config(object):
    @staticmethod
    def __load__(data):
        if type(data) is dict:
            return Config.load_dict(data)
        elif type(data) is list:
            return Config.load_list(data)
        else:
            return data

    @staticmethod
    def load_dict(data: dict):
        result = Dict()
        for key, value in data.items():
            result[key] = Config.__load__(value)
        return result

    @staticmethod
    def load_list(data: list):
        result = [Config.__load__(item) for item in data]
        return result

    @staticmethod
    def validate(data: dict):
        return True

    @staticmethod
    def load_json_file(path: str, default: dict = {}):
        if not os.path.exists(path):
            cdir = os.path.dirname(path) if os.path.dirname(path) else '.'
            if not os.path.exists(cdir):
                os.makedirs(cdir)
            log.warn("Configuration file not found, writing default configuration to '{}'".format(path))
            with open(path, "w") as f:
                f.write(json.dumps(default))

        assert os.path.exists(path), "Invalid config path {}".format(path)
        result = Config.__load__(default)
        log.warn("Using configuration file '{}'".format(path))
        with open(path, "r") as f:
            configjson = json.loads(f.read())
            assert Config.validate(configjson)
            result.merge(Config.__load__(configjson))
        #log.debug(result)
        return result

    @staticmethod
    def load_json(configjson: dict, default: dict = {}):
        result = Config.__load__(default)
        assert Config.validate(configjson)
        result.merge(Config.__load__(configjson))
        return result

class Timeout(object):
    def __init__(self, timeout=None):
        self.timeout = None
        self.originalTimeout = timeout

    def arm(self, timeout=None):
        self.timeout = int(time.time()) + timeout if timeout else (int(time.time()) + self.originalTimeout if self.originalTimeout else None)
        assert self.timeout is not None

    def armed(self):
        return self.timeout is not None

    def reset(self):
        self.timeout = None

    def expired(self):
        if self.timeout and int(time.time()) > self.timeout:
            self.timeout = None
            return True
        return False

    def check(self):
        if not self.armed():
            self.arm()
        return self.expired()

class Job(threading.Thread):
    def __init__(self, callback, *args, **kwargs):
        threading.Thread.__init__(self)
        self.stopped = threading.Event()
        self.callback = callback
        self.args = args
        self.kwargs = kwargs
        self.stopped.set()

    def run(self):
        # self.callback(self, *self.args, **self.kwargs)
        self.callback()
        self.stopped.set()

    def isAlive(self):
        return not self.stopped.is_set()

    def isStopped(self, wait=0):
        return self.stopped.is_set() or self.stopped.wait(wait)

    def start(self):
        if not self.isAlive():
            self.stopped.clear()
            #log.debug(f"Starting job {self.callback} with args: {self.args}, kwargs: {self.kwargs}")
            threading.Thread.start(self)

    def stop(self):
        self.stopped.set()
        try:
            #log.debug(f"Stopping job {self.callback}")
            self.join()
        except RuntimeError:
            pass

class PeriodicJob(Job):
    def __init__(self, interval, callback = None, initialRun = False, *args, **kwargs):
        super().__init__(callback, *args, **kwargs)
        self.interval = interval
        self.initialRun = initialRun

    def start(self, interval=None, initialRun=None):
        self.interval = interval if interval is not None else self.interval
        self.initialRun = initialRun if initialRun is not None else self.initialRun
        super().start()

    def run(self):
        interval = self.interval if not self.initialRun else 0
        while not self.stopped.wait(interval):
            start = time.time()
            self.callback(*self.args, **self.kwargs)
            interval = self.interval - (time.time() - start)
            if interval < 0:
                interval = 0
                log.warn(f"Callback took longer than configured interval ({self.interval})")

class PeriodicTimer(threading.Thread):
    def __init__(self, interval, callback, initialRun = False, retryCount = 0, retryInterval = 1, *args, **kwargs):
        threading.Thread.__init__(self)
        self.stopped = threading.Event()
        self.interval = interval
        self.callback = callback
        self.initialRun = initialRun
        self.retryCount = retryCount
        self.retries = retryCount
        self.retryInterval = retryInterval
        self.args = args
        self.kwargs = kwargs

    def start(self, interval=None, initialRun = None):
        self.interval = interval if interval is not None else self.interval
        self.initialRun = initialRun if initialRun is not None else self.initialRun
        threading.Thread.start(self)
        return self

    def stop(self):
        self.stopped.set()
        if self.is_alive():
            self.join()

    def run(self):
        if self.initialRun:
            interval = 1
            self.initialRun = False
        else:
            interval = self.interval
        while not self.stopped.wait(interval):
            start = time.time()
            # result = self.callback(*self.args, **self.kwargs)
            result = self.callback()
            if result is not None and result is False and self.retryCount != 0:
                if self.retries != 0:
                    self.retries -= 1 if self.retryCount > 0 else 0
                    log.warn(f"Callback {self.callback} failed, retrying in {self.retryInterval} seconds [retries remaining: {self.retries if self.retryCount > 0 else 'infinite'}]")
                    interval = self.retryInterval
                else:
                    log.error(f"Callback {self.callback} failed, no more retries")
                    break
            else:
                self.retries = self.retryCount
                interval = self.interval - (time.time() - start)
            if interval < 0:
                interval = 0
                log.warn(f"Callback took longer than configured interval ({self.interval})")

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]

def staticVars(**kwargs):
    def decorate(func):
        for k in kwargs:
            setattr(func, k, kwargs[k])
        return func
    return decorate

def isIPAddress(address):
    try:
        ipaddress.ip_address(address)
        return True
    except ValueError:
        return False

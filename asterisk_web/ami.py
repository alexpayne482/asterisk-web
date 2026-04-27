import os, sys, logging, argparse, json, time, threading
from abc import abstractmethod

from asterisk.ami import AMIClient, AutoReconnect, SimpleAction, EventListener, AMIClientListener

from .globals import _app_name

log = logging.getLogger(_app_name + ".ami")



class AMIClientWrapper(threading.Thread):
    def __init__(self, host, port=5038, username=None, password=None, delay=0.5):
        super().__init__()
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.delay = delay
        self.finished = None
        self.connected = False
        self._ami_client = AMIClient(address=host, port=port, timeout=10, on_connect=self.on_connect, on_disconnect=self.on_disconnect)

    def connect_and_login(self):
        if not self.username or not self.password:
            log.warning('AMI credentials not provided, skipping login')
            return True

        try:
            f = self._ami_client.login(username=self.username, secret=self.password)
            if f.response.is_error():
                log.error('Failed to login to AMI')
                return False
        except Exception as e:
            log.error('AMI login exception: {}'.format(e))
            return False

        log.info('AMI logged in successfully')
        self.finished = threading.Event()
        self.start()

        return True

    def ping(self):
        try:
            f = self._ami_client.send_action(Action('Ping'))
            response = f.response
            if response is not None and not response.is_error():
                return True
        except Exception as ex:
            pass
        return False

    def try_reconnect(self):
        try:
            f = self._ami_client.login(username=self.username, secret=self.password)
            response = f.response
            if response is not None and not response.is_error():
                return True
        except:
            pass
        return False

    def run(self):
        self.finished.wait(self.delay)
        while not self.finished.is_set():
            if not self.ping():
                self.try_reconnect()
            self.finished.wait(self.delay)

    def on_connect(self, source):
        log.info('AMI client connected to {}:{}'.format(self.host, self.port))
        self.connected = True

    def on_disconnect(self, source, error):
        log.info('AMI client disconnected from {}:{} [{}]'.format(self.host, self.port, error))
        self.connected = False

    def event_listener(self, event, **kwargs):
        log.debug('AMI Event: {}'.format(event))

    def action(self, action, timeout=10, **kwargs):
        if not self.connected:
            log.error('AMI client not connected')
            return {
                'success': False,
                'action': action,
                'id': None,
                'data': [],
                'error': 'AMI client not connected',
            }

        complete_received = True
        action_id = None
        data = {}
        events = []
        deadline = time.time() + timeout

        def _event_listener(event, source):
            nonlocal complete_received, action_id, events

            event_action_id = event.keys.get('ActionID') or event.keys.get('ActionId') or event.keys.get('actionid')
            complete = event.keys.get('Event', '').lower() == 'complete' or event.keys.get('EventList', '').lower() == 'complete'
            items = event.keys.get('ListItems', '').lower()

            if action_id and str(event_action_id) != str(action_id):
                return

            if complete:
                complete_received = True
            else:
                events.append(event.keys)

        self._ami_client.add_event_listener(_event_listener)

        log.debug('Sending AMI action: {} {}'.format(action, kwargs))
        f = self._ami_client.send_action(SimpleAction(action, **kwargs))
        if f.response.is_error():
            log.error('AMI action {} error: {}'.format(action, f.response))
            return {
                'success': False,
                'action': action,
                'id': None,
                'data': {},
                'error': f.response.status + ': ' + f.response.keys.get('Message', 'Unknown error'),
            }

        action_id = f.response.keys.get('ActionID') or f.response.keys.get('ActionId') or f.response.keys.get('actionid')
        for key, value in f.response.keys.items():
            data[key] = value
            if key.lower() in ['eventlist']:
                complete_received = False

        try:
            while time.time() < deadline:
                if complete_received:
                    break
                time.sleep(0.1)
        finally:
            self._ami_client.remove_event_listener(_event_listener)

        if events:
            data['events'] = list(filter(lambda e: str(e.get('ActionID') or e.get('ActionId') or e.get('actionid')) == str(action_id), events)) if action_id else events

        log.debug('Received AMI complete response: {} {} -> {}'.format(action, action_id, data))
        return {
            'success': True,
            'action': action,
            'id': action_id,
            'data': data,
            'error': None,
        }
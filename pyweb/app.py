import os, sys, logging, argparse, json, time
from abc import abstractmethod

from .globals import _app_name, _app_full_name, _app_description, _def_server_port
from .utils import Singleton

log = logging.getLogger(_app_name + ".app")

class App(object, metaclass=Singleton):
    def __init__(self):
        pass

    @staticmethod
    def add_arguments(subparsers, parser=None):
        if not parser:
            parser = subparsers.add_parser('server', help='Run as web server')
        parser.add_argument('-p', '--port', default=_def_server_port, help=f'Listening port for web API (default {_def_server_port})')
        return parser

    def init(self, args):
        log.info('Initializing {}...'.format(_app_full_name))
        return self

    def run(self):
        log.info('Running {}...'.format(_app_full_name))

    def exit(self):
        log.info('Exiting {}...'.format(_app_full_name))


def run():
    logging.basicConfig(format='%(asctime)-16s %(levelname)-8s %(name)-16s %(message)s', level=logging.INFO)
    logging.getLogger(_app_name).setLevel(logging.INFO)

    parser = argparse.ArgumentParser(description=_app_description)
    parser.add_argument('-d', '--debug', default=False, action='store_true', help='enable debug prints (default disabled)')
    parser.add_argument('-v', '--version', default=False, action='store_true', help='print version and exit')

    App.add_arguments(None, parser)
    args = parser.parse_args()

    if args.version:
        print(f'Version: {__version__}')
        sys.exit(0)
    if args.debug:
        logging.getLogger(_app_name).setLevel(logging.DEBUG)

    try:
        instance = App().init(args)
        instance.run()
    except Exception as e:
        log.error('Exception terminated {}'.format(e))
        raise
    except KeyboardInterrupt as e:
        print('### KeyboardInterrupt ###')
        pass
    finally:
        if instance:
            instance.exit()
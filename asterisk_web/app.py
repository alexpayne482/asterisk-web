import os, sys, logging, argparse, json, time
from abc import abstractmethod
import requests as _requests
from flask import Flask, render_template, jsonify, abort, current_app, request, Response
from flask_cors import CORS

from .ami import AMIClientWrapper
from .globals import _app_name, _app_full_name, _app_description, _def_server_port, _def_ami_uri, _def_ari_uri
from .utils import Singleton, ModulePath

log = logging.getLogger(_app_name + ".app")

class App(object, metaclass=Singleton):
    webFolder = 'www'
    app = Flask (__name__,
                 static_folder=os.path.join(ModulePath(), webFolder),
                 template_folder=os.path.join(ModulePath(), webFolder),
    )

    @staticmethod
    def split_uri(uri=None):
        host = None
        port = None
        user = None
        password = None

        if uri is None:
            return (host, port, user, password)

        if '@' in uri:
            credentials, location = uri.rsplit('@', 1)
            if ':' in credentials:
                user, password = credentials.split(':', 1)
            else:
                user = credentials
        else:
            location = uri

        if ':' in location:
            host, port_str = location.rsplit(':', 1)
            try:
                port = int(port_str)
            except ValueError:
                host = location
                port = 5038
        else:
            host = location

        return (host, port, user, password)

    @staticmethod
    def add_arguments(subparsers, parser=None):
        if not parser:
            parser = subparsers.add_parser('server', help='Run as web server')
        parser.add_argument('-p', '--port', default=_def_server_port, help=f'Listening port for web API (default {_def_server_port})')
        parser.add_argument('--ami', default=_def_ami_uri, help=f'AMI URI (default {_def_ami_uri})')
        parser.add_argument('--ari', default=_def_ari_uri, help=f'ARI URI (default {_def_ari_uri})')
        return parser

    # serve static files for react app
    @app.route('/', defaults={'path': None})
    @app.route('/<path:path>')
    def serve(path):
        if path and os.path.exists(os.path.join(current_app.static_folder, path)):
            return current_app.send_static_file(path)
        elif path == 'manifest.json':
            return jsonify({})
        return render_template('index.html', path=path)

    @app.route('/api/v1/ami/action/<action>', methods=['GET', 'POST'])
    def api_action(action):
        params = {}
        if request.method == 'POST' and request.is_json:
            params = request.get_json()
            log.debug('Action parameters: {}'.format(params))
        result = App()._ami.action(action, timeout=10, **params)
        return jsonify(result)

    @app.route('/api/v1/ari/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
    def api_ari(path):
        ari_base = App()._ari_base
        ari_creds = App()._ari_creds
        if not ari_base or not ari_creds:
            log.error('ARI URI not configured, cannot proxy request')
            return jsonify({'error': 'ARI URI not configured'}), 500

        if not ari_base.startswith('http://') and not ari_base.startswith('https://'):
            ari_base = 'http://' + ari_base
        target_url = f'{ari_base.rstrip("/")}/{path}'
        try:
            resp = _requests.request(
                method=request.method,
                url=target_url,
                params=request.args,
                data=request.get_data(),
                headers={k: v for k, v in request.headers if k.lower() != 'host'},
                auth=ari_creds,
                timeout=10,
                allow_redirects=False,
            )
            return Response(resp.content, status=resp.status_code, content_type=resp.headers.get('Content-Type', 'application/json'))
        except _requests.exceptions.RequestException as e:
            log.error('ARI proxy error: {}'.format(e))
            return jsonify({'error': str(e)}), 502

    def __init__(self):
        self._args = None

        CORS(self.app)
        # from .api import api_v1
        # self.app.register_blueprint(api_v1)

    def init(self, args):
        log.info('Initializing {}...'.format(_app_full_name))
        self._args = args

        log.info('Connecting to AMI with URI: {}'.format(args.ami))
        host, port, user, password = self.split_uri(args.ami)

        self._ami = AMIClientWrapper(host=host, port=port, username=user, password=password)
        if not self._ami.connect_and_login():
            return None

        if args.ari:
            log.info('Using ARI URI: {}'.format(args.ari))
            host, port, user, password = self.split_uri(args.ari)
            self._ari_base = f'http://{host}:{port}/ari'
            self._ari_creds = (user, password) if user else None

        return self

    def run(self):
        log.info('Running {}...'.format(_app_full_name))
        self.app.run(host='0.0.0.0', port=self._args.port)

    def exit(self):
        log.info('Exiting {}...'.format(_app_full_name))
        if self._ami:
            self._ami.finished.set()
            self._ami.join()


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
        instance = None
        instance = App().init(args)
        if instance is None:
            log.error('Failed to initialize App')
            sys.exit(1)
        instance.run()
    except Exception as e:
        log.error('Exception terminated: {}'.format(e))
        raise
    except KeyboardInterrupt as e:
        print('### KeyboardInterrupt ###')
        pass
    finally:
        if instance:
            instance.exit()
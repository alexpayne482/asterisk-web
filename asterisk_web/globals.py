import os
import importlib.resources
from .version import __version__

__author__ = 'liviuflore'

_app_name = 'asterisk_web'
_app_full_name = f'asterisk web v{__version__}'
_app_description = f'asterisk_web - asterisk web (v{__version__})'
_sdir = os.path.dirname(os.path.realpath(__file__))
# _cwd = os.getcwd()

_def_server_port = 8288
_def_ami_uri = 'admin@localhost:5038'
_def_ari_uri = 'admin@localhost:8088'

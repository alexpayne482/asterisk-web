import os
import importlib.resources
from .version import __version__

__author__ = 'liviuflore'

_app_name = 'astar'
_app_full_name = f'aStar v{__version__}'
_app_description = f'astar - aStar (v{__version__})'
_sdir = os.path.dirname(os.path.realpath(__file__))
# _cwd = os.getcwd()

_def_server_port = 8288

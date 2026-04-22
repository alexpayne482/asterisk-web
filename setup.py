import setuptools, os


def get_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

def getVersion(fileName):
    import re
    with open(fileName, "rt") as vf:
        VSRE = r"^__version__ = ['\"]([^'\"]*)['\"]"
        for line in vf:
            mo = re.search(VSRE, line, re.M)
            if mo:
                return mo.group(1)
    return "0.0.0"

def getRequirements(fileName):
    with open(fileName, "rt") as rf:
        return [line.strip() for line in rf if line.strip() and not line.startswith("#")]


moduleName = "astar"

setuptools.setup (
    name = moduleName,
    author = "Liviu Flore",
    author_email = "liviu.flore@keysight.com",
    description = "Template for a Python web application",

    version = getVersion(f"{moduleName}/version.py"),
    long_description = get_readme(),
    long_description_content_type = "text/markdown",
    python_requires = ">=3.10",
    packages = setuptools.find_packages(),
    install_requires = getRequirements("requirements.txt"),
    include_package_data=True,
    entry_points = {
        'console_scripts': [
            f'{moduleName}={moduleName}:run',
        ],
    },
)

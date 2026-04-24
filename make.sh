#!/usr/bin/env bash
set -ex

appname="asterisk_web"
publish=${PUBLISH:-0}
deploy=${DEPLOY:-0}
buildweb=${BUILD_WEB:-1}

version=$(cat VERSION)
if [ $publish -ne 0 ]; then
    if [ -z "$(git status --porcelain)" ]; then
        echo "Working directory clean"
    else
        echo "Working directory not clean. Please commit changes before publishing"
        exit 1
    fi
    # increase build number and get it
    major=$(echo $version | cut -d. -f1)
    minor=$(echo $version | cut -d. -f2)
    patch=$(echo $version | cut -d. -f3)
    patch=$((patch + 1))
    version="$major.$minor.$patch"
    echo $version > VERSION
fi

# build webapp
if [ $buildweb -ne 0 ]; then
    pushd web
    echo "Building $appname webapp v$version"
    sed -i '' "s/\"version\":.*$/\"version\": \"$version\",/g" ./package.json
    if [ ! -d node_modules ]; then
        echo "Installing dependencies"
        npm install || { echo "error installing dependencies"; popd; exit 1; }
    fi
    echo "Building webapp"
    npm run build || { echo "error building webapp"; popd; exit 1; }
    rm -rf ../$appname/www/assets && mkdir -p ../$appname/www && cp -r dist/* ../$appname/www
    popd
    echo "Webapp build complete: $appname v$version"
fi

# build python app
echo "Building $appname app v$version"
mkdir -p dist
sed -i '' "s/__version__ = '.*'/__version__ = '$version'/g" ./$appname/version.py
python3 setup.py sdist || { echo "error building python app"; exit 1; }
ln -sf $appname-$version.tar.gz dist/$appname-latest.tar.gz || { echo "error creating symlink for latest version"; exit 1; }
echo "App build complete: $appname-$version"
echo "App saved to dist/$appname-$version.tar.gz"

if [ $publish -ne 0 ]; then
    echo "Publishing v$version"
    if [ -n "$(git tag -l "v$version")" ]; then
        echo "Tag v$version already exists. Please update version number in VERSION file."
        exit 1
    fi
    git add .
    git commit -m "build v$version"

    # GitHub publish
    assets=" --asset dist/$appname-$version.tar.gz"
    gh release create v$version $assets || { echo "error creating release on GitHub"; exit 1; }

    # Push to git
    git push origin main || { echo "error pushing to git"; exit 1; }
    echo "Published v$version"
fi
#!/usr/bin/env bash
set -ex

appname="astar"
publish=${PUBLISH:-0}
deploy=${DEPLOY:-0}
buildweb=${BUILD_WEB:-1}
builddocker=${BUILD_DOCKER:-${publish}}

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

# build docker image
if [ $builddocker -ne 0 ]; then
    echo "Building Docker image for $appname v$version"
    docker build -t $appname:$version --platform linux/amd64/v2 -f docker/Dockerfile . || { echo "error building docker image"; exit 1; }
    docker tag $appname:$version $appname:latest
    echo "Docker image build complete: $appname:$version, $appname:latest"

    docker save $appname:$version -o dist/$appname-docker-$version.tar.gz || { echo "error saving docker image"; exit 1; }
    ln -sf $appname-docker-$version.tar.gz dist/$appname-docker-latest.tar.gz || { echo "error creating symlink for latest version docker image"; exit 1; }
    echo "Docker image saved to dist/$appname-docker-$version.tar.gz"

    # docker import dist/$appname-docker-latest.tar.gz
    # docker-compose -f docker/docker-compose.yaml --project-directory . up -d
    # docker-compose -f docker/docker-compose.yaml --project-directory . up --build

    # docker load -i ~/astar-docker-0.1.13.tar.gz
    # sed -i -e 's/image: astar:.*/image: astar:0.1.13/g' docker-compose.yaml
    # sudo docker-compose up -d
    # VER=0.1.13 && docker load -i ~/astar-docker-$VER.tar.gz && sed -i -e "s/image: astar:.*/image: astar:$VER/g" docker-compose.yaml && sudo docker-compose up -d
fi

if [ $publish -ne 0 ]; then
    echo "Publishing v$version"
    if [ -n "$(git tag -l "v$version")" ]; then
        echo "Tag v$version already exists. Please update version number in VERSION file."
        exit 1
    fi
    git add .
    git commit -m "build v$version"

    # Gitea publish
    # assets=" --asset dist/$appname-$version.tar.gz"
    # if [ $builddocker -ne 0 ]; then
    #     assets+=" --asset dist/$appname-docker-$version.tar.gz"
    #     assets+=" --asset docker/docker-compose.yaml"
    # fi
    # tea releases create --tag v$version --target main -t v$version $assets || { echo "error creating release on GitHub"; exit 1; }

    # Push to git
    git push origin main || { echo "error pushing to git"; exit 1; }
    echo "Published v$version"
fi
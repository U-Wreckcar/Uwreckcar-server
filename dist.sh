#!/bin/bash

stat build && rm -rf build

mkdir build

# Archive artifacts
zip build/$npm_package_name.zip -r dist temp package.json package-lock.json .ebextensions .platform
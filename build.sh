#!/bin/sh

rm -rf out/
mkdir out/

zip -r -FS out/bundle.xpi * \
    -x build.sh \
-x out/

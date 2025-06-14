#!/bin/sh
set -e
zola build
aws s3 sync public s3://preview-archive.it-help.tech --delete

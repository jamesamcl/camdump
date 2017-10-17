#!/usr/bin/env bash

scp $1 root@myhost:/home/you/cctv/$(basename $1)
rm -f $1





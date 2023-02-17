#!/bin/sh

# README:
# needs tmux for this to work

# change to your project name
SESSION_NAME='maia-server'

tmux kill-session -t $SESSION_NAME

exit 0
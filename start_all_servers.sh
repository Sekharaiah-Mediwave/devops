start_all_servers.sh#!/bin/sh

# README:
# needs tmux for this to work
# all this does is it goes into the services folder and runs the services
# within tmux
# tmux a -t maia-server
# use above to connect to tmux session

# change to your project name
SESSION_NAME='maia-server'
FOLDER="$PWD/services" # assuming script is run as contrib/start_all_servers.sh
OLD="$PWD"

# start base session
tmux new-session -s $SESSION_NAME -d

# run all service names
count=1
for service_folder in "$FOLDER"/*
do
  service_name=$(basename $service_folder)
  echo "Running :: $service_name"
  cd $service_folder
  # append each pane with new service
    if [ "$service_name" = 'auth' ] || 
    [ "$service_name" = 'database' ] || 
    [ "$service_name" = 'cache' ] || 
    [ "$service_name" = 'circle' ] ||
    [ "$service_name" = 'controller' ] || 
    [ "$service_name" = 'app_settings' ] || 
    [ "$service_name" = 'user' ] || 
    [ "$service_name" = 'email' ];
    then
      tmux new-window -t $SESSION_NAME:$count -n $service_name && tmux send-keys -t $SESSION_NAME:$count "npm start" C-m
    elif [ "$service_name" = 'env-files' ]
    then
      echo $service_name
    else
      tmux new-window -t $SESSION_NAME:$count -n $service_name && tmux send-keys -t $SESSION_NAME:$count "" C-m
    fi
# tmux new-window -t $SESSION_NAME:$count -n $service_name && tmux send-keys -t $SESSION_NAME:$count "npm start" C-m

    if [ "$service_name" != 'env-files' ]
      then
        count=`expr $count + 1`
      fi
done

tmux a -t maia-server

exit 0

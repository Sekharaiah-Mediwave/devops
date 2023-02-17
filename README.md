# Running the project

Project is configured with single setup1. 

## Steps to follow mentioned below
- Check database credentials on env.sample 
- Make sure database have been created.
- Check intial_setup.js for basic configuration if needed modify it.

```js
node intial_setup.js
```

- Just copy the .env.sample to . env

```js
node intial_setup.js cp-env
```

Project is configured with eslint. so first run the following command

```js
npm install -g eslint
```

To start all servers in tmux, first install tmux by following command
If mac

```js
brew install tmux
```

If Ubuntu
```js
sudo apt install tmux
```

Then start 

```js
start_all_servers.sh
```

There is a .tmux.conf file that you can use to set tmux up. Read it for instructions. To select a section in tmux
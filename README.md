# Fitness Timer

Just a timer in which you can define multiple exercises, their duration, and the number of times all these exercises must be looped as well as a rest duration between those loops.

https://timer.durss.ninja

In its current state, the server code only serves static files and manages the history mode of the vue router by redirecting all URLs to index.html.

## Environment setup
Install Node :
https://nodejs.org/en/download/

Install typescript :
```
npm install -g typescript
```


## Project setup
```
npm install
```

### Compiles and hot-reloads frontend AND server for development
```
npm run dev
```

### Compiles and minifies frontend AND server for production
```
npm run build
```

### Run server
```
node server/bootstrap.js
```
Run it as a service with PM2 :
```
pm2 start bootstrap-pm2.json
```

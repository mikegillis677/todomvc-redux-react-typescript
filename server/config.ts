import * as argv from 'yargs';

export interface ServerConfig {
  jwtSecret: string,
  port: number,
  url: string,
  publicPath: string
}

export var config: ServerConfig = {
  jwtSecret: 'e6f3517990a148af891379a0eea24921',
  port: process.env.PORT || 8000,
  url: argv.argv.production ? 'https://nu-pomodoro.herokuapp.com/' : 'http://localhost:8000',
  publicPath: argv.argv.production ? './public/production' : './public/development'
};

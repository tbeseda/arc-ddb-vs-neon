@app
arc-ddb-vs-neon

@http
get /
get /test

@tables
things
  key *String

@aws
runtime nodejs16.x
architecture arm64

@begin
appID 0R2J3J1B # Begin staging
# appID JC9C737Z # Begin production

# linter-erlang-dialyzer package

Tries to implement a linter using Erlangs dialyzer. The code is a minorly rewritten version of [linter-erlang](https://github.com/RaoH/linter-erlang).

## Plugin installation
```
$ apm install linter-erlang-dialyzer
```

## Settings
You can configure linter-erlang-dializer by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):

```
"linter-erlang-dialyzer":
  includeDirs: "./include" #Space seperated list of include paths
  executablePath: "/usr/local/bin/erlc" # default.
  paPaths: "./ebin" # Space seperated list of paths added to -pa flag. This will be done automatically in a project folder.
```

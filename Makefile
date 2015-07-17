NPM_EXECUTABLE_HOME := node_modules/.bin

PATH := ${NPM_EXECUTABLE_HOME}:${PATH}

dev: build
	@coffee -wco lib src

build:
	@coffee -co lib src

clean:
	@rm -fr lib/

.DEFAULT_GOAL := build

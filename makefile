.SUFFIXES:
.PHONY: cleanall

TOP := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

SHOOTERSRC = $(wildcard shooter/*.js)
SHOOTERES5 = $(SHOOTERSRC:%.js=es5/%.js)

BREAKOUTSRC = $(wildcard breakout/*.js)
BREAKOUTES5 = $(BREAKOUTSRC:%.js=es5/%.js)

LIBSRC = $(wildcard lib/*.js)
LIBES5 = $(LIBSRC:%.js=es5/%.js)

RES =  es5/lib/img es5/lib/snd

all: shooter breakout es5/index.html

shooter:  $(SHOOTERES5)  es5/shooter/index.html  $(LIBES5) $(RES) es5/shooter/bundle.js
breakout: $(BREAKOUTES5) es5/breakout/index.html $(LIBES5) $(RES) es5/breakout/bundle.js

es5/shooter/bundle.js:  $(SHOOTERES5) $(LIBES5)
	browserify es5/shooter/main.js -o $@

es5/breakout/bundle.js:  $(BREAKOUTES5) $(LIBES5)
	browserify es5/breakout/main.js -o $@

es5/%.js: %.js
	mkdir -p $(@D)
	babel $< -o $@

es5/%.html: %.html
	mkdir -p $(@D)
	cp $< $@

es5/lib/img: $(TOP)/lib/img
    ifeq ("$(wildcard $<)","")
	ln -s $< $@
    endif

es5/lib/snd: $(TOP)/lib/snd
    ifeq ("$(wildcard $<)","")
	ln -s $< $@
    endif

es5/index.html: README.md
	echo -e "<!DOCTYPE html>\n<html>\n<body>\n" >$@
	-md2html README.md >>$@
	echo -e "\n<body>\n<html>" >>$@

cleanall:
	rm -r es5

'use strict';

var util = require('util');
var Orchestrator = require('orchestrator');
var gutil = require('gulp-util');
var deprecated = require('deprecated');
var vfs = require('vinyl-fs');

function Gulp() {
  Orchestrator.call(this);
}
util.inherits(Gulp, Orchestrator);

// impose our opinion of "default" tasks onto orchestrator
var orchestratorParallel = Gulp.prototype.parallel;
var orchestratorSeries = Gulp.prototype.series;
Gulp.prototype.parallel = function () {
  var tasks = arguments.length ? arguments : ['default'];
  return orchestratorParallel.apply(this, tasks);
};
Gulp.prototype.series = function () {
  var tasks = arguments.length ? arguments : ['default'];
  return orchestratorSeries.apply(this, tasks);
};

Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;
Gulp.prototype.watch = function(glob, opt, fn) {
  if (!fn) {
    fn = opt;
    opt = null;
  }

  // array of tasks given
  if (Array.isArray(fn)) {
    return vfs.watch(glob, opt, function() {
      this.run(this.parallel.apply(this, fn), {continueOnError:true}, function (err/*, stat*/) {
        if (err) {
          gutil.log(err); // show but don't blow up
        }
      });
    }.bind(this));
  }

  return vfs.watch(glob, opt, fn);
};

// let people use this class from our instance
Gulp.prototype.Gulp = Gulp;

// deprecations
deprecated.field('gulp.env has been deprecated. Use your own CLI parser instead. We recommend using yargs or minimist.', console.log, Gulp.prototype, 'env', gutil.env);
Gulp.prototype.start = deprecated.method('gulp.start() has been deprecated. Use task dependencies or gulp.run(gulp.parallel()) or gulp.run(gulp.series()) instead.', console.log, function () {});

var inst = new Gulp();
module.exports = inst;

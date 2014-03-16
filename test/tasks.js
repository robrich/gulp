'use strict';

var gulp = require('../');
var Q = require('q');
var should = require('should');
require('mocha');

describe('gulp tasks', function() {
  beforeEach(function () {
    gulp.reset();
  });
  afterEach(function () {
    gulp.reset();
  });
  describe('task()', function() {
    it('should define a task', function(done) {
      var fn;
      fn = function() {};
      gulp.task('test', fn);
      should.exist(gulp.tasks.test);
      gulp.tasks.test.fn.should.equal(fn);
      done();
    });
  });
  describe('runParallel()', function() {
    it('should run multiple tasks', function(done) {
      var a, fn, fn2;
      a = 0;
      fn = function(cb) {
        ++a;
        cb(null);
      };
      fn2 = function(cb) {
        ++a;
        cb(null);
      };
      gulp.task('test', fn);
      gulp.task('test2', fn2);
      gulp.runParallel('test', 'test2', function (err/*, stats*/) {
        a.should.equal(2);
        should.not.exist(err);
        done();
      });
    });
    it('should run all tasks when call runParallel() multiple times', function(done) {
      var a, fn, fn2, timeout = 20;
      a = 0;
      fn = function(cb) {
        ++a;
        cb(null);
      };
      fn2 = function(cb) {
        ++a;
        cb(null);
      };
      gulp.task('test', fn);
      gulp.task('test2', fn2);
      gulp.runParallel('test');
      gulp.runParallel('test2');
      setTimeout(function () {
        a.should.equal(2);
        done();
      }, timeout);
    });
    it('should run all async promise tasks', function(done) {
      var a, fn, fn2;
      a = 0;
      fn = function() {
        var deferred = Q.defer();
        setTimeout(function() {
          ++a;
          deferred.resolve();
        },1);
        return deferred.promise;
      };
      fn2 = function() {
        var deferred = Q.defer();
        setTimeout(function() {
          ++a;
          deferred.resolve();
        },1);
        return deferred.promise;
      };
      gulp.task('test', fn);
      gulp.task('test2', fn2);
      gulp.runParallel('test'); // FRAGILE: ASSUME: test is done before test2
      gulp.runParallel('test2', function() {
        a.should.equal(2);
        done();
      });
    });
    it('should run all async callback tasks', function(done) {
      var a, fn, fn2;
      a = 0;
      fn = function(cb) {
        setTimeout(function() {
          ++a;
          cb(null);
        },1);
      };
      fn2 = function(cb) {
        setTimeout(function() {
          ++a;
          cb(null);
        },1);
      };
      gulp.task('test', fn);
      gulp.task('test2', fn2);
      gulp.runParallel('test'); // FRAGILE: ASSUME: test is done before test2
      gulp.runParallel('test2', function() {
        a.should.equal(2);
        done();
      });
    });
    it('should return an error when task is not defined', function(done) {
      var taskName = 'taskThatDoesntExist';
      gulp.runParallel(taskName, function (err) {
        should.exist(err);
        err.missingTasks.length.should.equal(1);
        err.missingTasks[0].should.equal(taskName);
        done();
      });
    });
    it('should run task scoped to a copy of the task', function(done) {
      var a, fn, random = 'random val';
      a = 0;
      fn = function(cb) {
        this.name.should.equal('test');
        this.a.should.equal(random);
        ++a;
        cb(null);
      };
      gulp.task('test', {a:random}, fn);
      gulp.runParallel('test', function (err) {
        a.should.equal(1);
        should.not.exist(err);
        done();
      });
    });
    it('should run default task scoped to copy of task', function(done) {
      var a, fn;
      a = 0;
      fn = function(cb) {
        this.name.should.equal('default');
        ++a;
        cb(null);
      };
      gulp.task('default', fn);
      gulp.runParallel(function (err) {
        a.should.equal(1);
        should.not.exist(err);
        done();
      });
    });
  });
});

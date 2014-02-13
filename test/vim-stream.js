var test = require('tape')
  , stream = require('../')
  , through = require('through');

function buffer() {
  return through(function(b) { this.buf = (this.buf || '')+b; });
}

test('ignores insert mode text', function(t) {
  var s = stream({ noMeta: true })
    , b = buffer();
  s.pipe(b);
  var pieces = ['ab', 'Ab', 'ij', 'Ij', 'op', 'Op', 'Cd', 'a\x0d'];
  s.end(pieces.join('\x1b'));
  t.equal(b.buf, 'aAiIoOCa');
  t.end();
});

test('groups command mode keystrokes', function(t) {
  t.plan(2);

  var s = stream();
  s.once('command', function(keys) {
    t.equal(keys, ':wqa');
  });
  s.write('j:wqa\x0dj');

  s.once('command', function(keys) {
    t.equal(keys, ':%s/foo/bar/');
  });
  s.end('j:%s/foo/bar/\x0d');
});

test('translates meta/ctrl characters', function(t) {
  var s = stream()
    , b = buffer();
  s.pipe(b);
  s.end('\x01\x08\x1a\x1d');
  t.equal(b.buf, '^A^H^Z^]');
  t.end();
});

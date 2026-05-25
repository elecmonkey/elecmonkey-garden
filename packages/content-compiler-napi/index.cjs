let binding;
try {
  binding = require('./garden-content-compiler.node');
} catch {
  binding = {
    version() {
      return '0.0.0';
    },
  };
}

module.exports = binding;

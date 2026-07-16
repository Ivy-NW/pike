// Windows + Metro bug: resolving "main": "expo-router/entry" directly through node_modules
// produces a bundle URL with literal backslashes (node_modules\expo-router\entry.bundle),
// which 404s. A local entry file resolves via a relative path instead, avoiding the bug.
import "expo-router/entry";

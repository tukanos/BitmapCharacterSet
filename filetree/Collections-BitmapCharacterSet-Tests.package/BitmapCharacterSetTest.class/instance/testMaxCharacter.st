tests
testMaxCharacter
	| set |

	set := self emptySet.
	set add: self lastCodePoint asCharacter.
	self assert: (set includes: self lastCodePoint asCharacter).
	self
		should: [ set add: (self lastCodePoint + 1) asCharacter ]
		raise: Error.
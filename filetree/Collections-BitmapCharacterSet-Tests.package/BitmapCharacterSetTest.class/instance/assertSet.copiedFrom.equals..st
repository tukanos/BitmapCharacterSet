asserting
assertSet: aFirstSet copiedFrom: aSecondSet equals: aThirdSet
	self
		deny: aFirstSet == aSecondSet;
		deny: aFirstSet byteCharacters == aSecondSet byteCharacters.
	(aFirstSet wideCharacters isNotNil
		or: [aSecondSet wideCharacters isNotNil])
		ifTrue: [self deny: aFirstSet wideCharacters == aSecondSet wideCharacters].

	self assert: aFirstSet = aThirdSet.
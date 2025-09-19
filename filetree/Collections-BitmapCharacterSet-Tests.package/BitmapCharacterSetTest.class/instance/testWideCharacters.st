tests
testWideCharacters
	0 to: 7 do: [ :i |
		| set character |
		set := self setClass new.
		character := (256 + i) asCharacter.
		self assert: set wideCharacters isNil.
		set add: character.
		self assert: set wideCharacters first = (16r80 bitShift: i negated).
		set remove: character.
		self assert: set wideCharacters first = 0 ].
	0 to: 7 do: [ :i |
		| set character |
		set := self setClass new.
		character := (256 + 8 + i) asCharacter.
		self assert: set wideCharacters isNil.
		set add: character.
		self assert: set wideCharacters second = (16r80 bitShift: i negated).
		set remove: character.
		self assert: set wideCharacters second = 0 ]
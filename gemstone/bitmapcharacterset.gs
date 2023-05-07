! Class Declarations
! Generated file, do not Edit

doit
(Collection
	indexableSubclass: 'BitmapCharacterSet'
	instVarNames: #( byteCharacters wideCharacters tally )
	classVars: #(  )
	classInstVars: #(  )
	poolDictionaries: #()
	inDictionary: UserGlobals
	options: #()
)
		category: 'Collections-BitmapCharacterSet-Core';
		comment: 'This class implements a set of Character objects similar to CharacterSet and WideCharacterSet, but it uses a bitmap internally to test if wide (multibyte) characters belong to it rather than using a Dictionary like WideCharacterSet does. For byte characters, a simple 256-element Array is used, the same as with CharacterSet, which is faster but uses more memory.

(Used by and heavily optimized for XMLParser; please refactor carefully)';
		immediateInvariant.
true.
%

doit
(TestCase
	subclass: 'BitmapCharacterSetTest'
	instVarNames: #( characters )
	classVars: #(  )
	classInstVars: #(  )
	poolDictionaries: #()
	inDictionary: UserGlobals
	options: #()
)
		category: 'Collections-BitmapCharacterSet-Tests';
		comment: 'Unit tests for BitmapCharacterSet';
		immediateInvariant.
true.
%

! Class implementation for 'BitmapCharacterSet'

!		Class methods for 'BitmapCharacterSet'

category: 'inspecting'
classmethod: BitmapCharacterSet
inspectorClass
	"does not use Set class>>inspectorClass because it is incompatible"
	^ Smalltalk tools inspectorClass
%

category: 'instance creation'
classmethod: BitmapCharacterSet
new
	^ self new: 256
%

category: 'instance creation'
classmethod: BitmapCharacterSet
new: aCapacity
	^ self basicNew initialize: aCapacity
%

category: 'instance creation'
classmethod: BitmapCharacterSet
newFrom: aCollection
	"for GS portability"
	^ self new
		addAll: aCollection;
		yourself	
%

!		Instance methods for 'BitmapCharacterSet'

category: 'copying'
method: BitmapCharacterSet
, aCollection
	"GS doesn't define #, for non-Sequenceable collections"
	^ self copy
		addAll: aCollection;
		yourself
%

category: 'comparing'
method: BitmapCharacterSet
= anObject
	self == anObject
		ifTrue: [^ true].

	(self species == anObject species
		and: [self size = anObject size])
		ifFalse: [^ false].

	self do: [:each |
		(anObject includes: each)
			ifFalse: [^ false]].
	^ true.
%

category: 'adding'
method: BitmapCharacterSet
add: aCharacter
	| asciiValue |

	"optimized for speed with inlining; do not refactor"
	(asciiValue := aCharacter asciiValue) < 256
		ifTrue: [
			(byteCharacters at: asciiValue + 1)
				ifFalse: [tally := tally + 1].
			byteCharacters
				at: asciiValue + 1
				put: true]
		ifFalse: [| byteIndex byte bitmask |
			"256 // 8 - 31 = 1 (first index), (256 + 8) // 8 - 31 = 2 (second), etc
			(with 'bitShift: -3' used over '// 8' for speed)"
			byteIndex := (asciiValue bitShift: -3) - 31.
			(wideCharacters == nil
				or: [byteIndex > wideCharacters size])
				ifTrue: [self growWideCharacterBitmapTo: (byteIndex * 1.5) asInteger].

			"raises an error if asciiValue > 16r10FFFF"
			byte := wideCharacters at: byteIndex.

			"for the byte bitmask, left shift 1 by 7 - (asciiValue \\ 8)
			(with 'bitAnd: 7' used over '\\ 8' for speed)"
			bitmask := 1 bitShift: 7 - (asciiValue bitAnd: 7).
			
			"increment the tally if the character is not already present"
			(byte bitAnd: bitmask) == 0
				ifTrue: [tally := tally + 1].

			wideCharacters
				at: byteIndex
				put: (byte bitOr: bitmask)].
	^ aCharacter.
%

category: 'adding'
method: BitmapCharacterSet
addRangeFrom: aStartCharacter to: aStopCharacter
	"Adds character range from aStartCharacter to aStopCharacter inclusive
	or none if aStartCharacter > aStopCharacter. Returns self to avoid
	creating a temp collection of the added characters."

	"chars don't support to:do: (compiled inline) and using to: and do:
	separately needlessly creates a (possibly large) temp array"
	aStartCharacter asciiValue
		to: aStopCharacter asciiValue
		do: [:i | self add: (Character value: i)]
%

category: 'private'
method: BitmapCharacterSet
byteCharacters
	^ byteCharacters
%

category: 'enumerating'
method: BitmapCharacterSet
byteCharactersDo: aBlock
	1 to: byteCharacters size do: [:i |
		(byteCharacters at: i)
			ifTrue: [aBlock value: (Character value: i - 1)]]
%

category: 'accessing'
method: BitmapCharacterSet
capacity
	^ byteCharacters size +
		(wideCharacters
			ifNil: [0]
			ifNotNil: [wideCharacters size * 8]).
%

category: 'converting'
method: BitmapCharacterSet
complement
	| copy |

	copy := self copyEmpty.
	0 to: 16r10FFFF do: [:i | | character |
		character := (Character value: i).
		(self includes: character)
			ifFalse: [copy add: character]].
	^ copy.
%

category: 'copying'
method: BitmapCharacterSet
copyEmpty
	"reimplemented for GS and Squeak compatibility"
	^ self species new: self capacity
%

category: 'enumerating'
method: BitmapCharacterSet
do: aBlock
	self
		byteCharactersDo: aBlock;
		wideCharactersDo: aBlock
%

category: 'private'
method: BitmapCharacterSet
growWideCharacterBitmapTo: aSizeInBytes
	| newSize |

	newSize := aSizeInBytes min: self maxWideCharactersSize.
	wideCharacters
		ifNil: [wideCharacters := ByteArray new: newSize]
		ifNotNil: [
			wideCharacters :=
				(ByteArray new: newSize)
					replaceFrom: 1
					to: wideCharacters size
					with: wideCharacters
					startingAt: 1].
%

category: 'comparing'
method: BitmapCharacterSet
hash
	| hash |

	hash := self species hash.
	self byteCharactersDo: [:each |
		hash := hash bitXor: each hash].
	^ hash bitXor: self size hash.
%

category: 'testing'
method: BitmapCharacterSet
hasWideCharacters
	self wideCharactersDo: [:each | ^ true].
	^ false.
%

category: 'testing'
method: BitmapCharacterSet
includes: aCharacter
	| asciiValue |

	"optimized for speed with inlining; do not refactor"
	(asciiValue := aCharacter asciiValue) < 256
		ifTrue: [^ byteCharacters at: asciiValue + 1]
		ifFalse: [| byteIndex |
			wideCharacters
				ifNil: [^ false].

			"256 // 8 - 31 = 1 (first index), (256 + 8) // 8 - 31 = 2 (second), etc
			(with 'bitShift: -3' used over '// 8' for speed)"
			(byteIndex := (asciiValue bitShift: -3) - 31) > wideCharacters size
				ifTrue: [^ false].

			"for the byte bitmask, left shift 1 by 7 - (asciiValue \\ 8)
			(with 'bitAnd: 7' used over '\\ 8' for speed)"
			^ ((wideCharacters at: byteIndex) bitAnd:
				(1 bitShift: 7 - (asciiValue bitAnd: 7))) > 0]
%

category: 'testing'
method: BitmapCharacterSet
includesRangeFrom: aStartCharacter to: aStopCharacter
	"Tests for character range from aStartCharacter to aStopCharacter
	inclusive. Always returns true if aStartCharacter > aStopCharacter."

	"chars don't support to:do: (compiled inline) and using to: and do:
	separately needlessly creates a (possibly large) temp array"
	aStartCharacter asciiValue
		to: aStopCharacter asciiValue
		do: [:i |
			(self includes: (Character value: i))
				ifFalse: [^ false]].
	^ true.
%

category: 'initialization'
method: BitmapCharacterSet
initialize: aCapacity
	byteCharacters := Array new: 256 withAll: false.
	aCapacity > 256
		ifTrue: [
			"(257 - 1) // 8 - 31 = 1 (first byte),
			(257 + 8 - 1) // 8 - 31 = 2 (second byte), etc
			(with 'bitShift: -3' used over '// 8' for speed)"
			self growWideCharacterBitmapTo: ((aCapacity - 1) bitShift: -3) - 31].
	tally := 0.
%

category: 'testing'
method: BitmapCharacterSet
isEmpty
	"Squeak's Collection>>#isEmpty is inefficient"
	^ self size = 0
%

category: 'private'
method: BitmapCharacterSet
maxWideCharactersSize
	^ 139232 "(16r10FFFF bitShift: -3) - 31"
%

category: 'copying'
method: BitmapCharacterSet
postCopy
	byteCharacters := byteCharacters copy.
	wideCharacters
		ifNotNil: [wideCharacters := wideCharacters copy].
%

category: 'removing'
method: BitmapCharacterSet
remove: aCharacter ifAbsent: aBlock
	| asciiValue |

	"optimized for speed with inlining; do not refactor"
	(asciiValue := aCharacter asciiValue) < 256
		ifTrue: [
			(byteCharacters at: asciiValue + 1)
				ifFalse: [^ aBlock value].
			byteCharacters
				at: asciiValue + 1
				put: false]
		ifFalse: [| byteIndex byte bitmask |
			wideCharacters
				ifNil: [^ aBlock value].
	
			"256 // 8 - 31 = 1 (first index), (256 + 8) // 8 - 31 = 2 (second), etc
			(with 'bitShift: -3' used over '// 8' for speed)"
			(byteIndex := (asciiValue bitShift: -3) - 31) > wideCharacters size
				ifTrue: [^ aBlock value].

			"for the byte bitmask, left shift 1 by 7 - (asciiValue \\ 8)
			(with 'bitAnd: 7' used over '\\ 8' for speed)"
			bitmask := 1 bitShift: 7 - (asciiValue bitAnd: 7).
			((byte := wideCharacters at: byteIndex) bitAnd: bitmask) == 0
				ifTrue: [^ aBlock value].

			wideCharacters
				at: byteIndex
				put: (byte bitAnd: bitmask bitInvert)].
	tally := tally - 1.
	^ aCharacter.
%

category: 'removing'
method: BitmapCharacterSet
removeAll
	"empties but preserves the capacity"

	1 to: byteCharacters size do: [:i |
		byteCharacters
			at: i
			put: false].
	wideCharacters
		ifNotNil: [
			1 to: wideCharacters size do: [:i |
				wideCharacters
					at: i
					put: 0]].
	tally := 0.
%

category: 'removing'
method: BitmapCharacterSet
removeRangeFrom: aStartCharacter to: aStopCharacter
	"Removes character range from aStartCharacter to aStopCharacter inclusive
	or none if aStartCharacter > aStopCharacter. Returns self to avoid
	creating a temp collection of the removed characters."

	"chars don't support to:do: (compiled inline) and using to: and do:
	separately needlessly creates a (possibly large) temp array"
	aStartCharacter asciiValue
		to: aStopCharacter asciiValue
		do: [:i | self remove: (Character value: i)]
%

category: 'accessing'
method: BitmapCharacterSet
size
	^ tally
%

category: 'private'
method: BitmapCharacterSet
wideCharacters
	^ wideCharacters
%

category: 'enumerating'
method: BitmapCharacterSet
wideCharactersDo: aBlock
	"optimized for speed with to:do: and inlining; do not refactor"
	| baseValue |

	wideCharacters
		ifNil: [^ self].

	baseValue := 256.
	1 to: wideCharacters size do: [:byteIndex | | byte |
		(byte := wideCharacters at: byteIndex) == 0
			ifFalse: [
				0 to: 7 do: [:shiftIndex |
					(byte bitAnd: (1 bitShift: 7 - shiftIndex)) == 0
						ifFalse: [
							aBlock value:
								(Character value: baseValue + shiftIndex)]]].
		baseValue := baseValue + 8].
%

! Class implementation for 'BitmapCharacterSetTest'

!		Instance methods for 'BitmapCharacterSetTest'

category: 'enumerating'
method: BitmapCharacterSetTest
absentCharactersDo: aBlock
	| previousValue |

	previousValue := 0.
	self charactersDo: [:each |
		previousValue + 1 to: each asciiValue - 1 do: [:i |
			aBlock value: i asCharacter].
		previousValue := each asciiValue].

	previousValue + 1 to: self lastCodePoint - 1 do: [:i |
		aBlock value: i asCharacter].
%

category: 'asserting'
method: BitmapCharacterSetTest
assertSet: aFirstSet copiedFrom: aSecondSet equals: aThirdSet
	self
		deny: aFirstSet == aSecondSet;
		deny: aFirstSet byteCharacters == aSecondSet byteCharacters.
	(aFirstSet wideCharacters notNil
		or: [aSecondSet wideCharacters notNil])
		ifTrue: [self deny: aFirstSet wideCharacters == aSecondSet wideCharacters].
	
	self assert: aFirstSet = aThirdSet.
%

category: 'accessing'
method: BitmapCharacterSetTest
characters
	^ characters
		ifNil: [| writeStream previousValue offset |
			writeStream := (Array new: 250000) writeStream.
			previousValue := 0.
			writeStream nextPut: previousValue asCharacter.
			offset := 1.
			1 to: self lastCodePoint do: [:i |
				previousValue + offset = i
					ifTrue: [
						writeStream nextPut: i asCharacter.
						previousValue := i.
						offset :=
							offset = 8
								ifTrue: [1]
								ifFalse: [offset + 1]]].
			characters := writeStream contents]
%

category: 'enumerating'
method: BitmapCharacterSetTest
charactersDo: aBlock
	self characters do: aBlock
%

category: 'accessing'
method: BitmapCharacterSetTest
emptySet
	^ self setClass new
%

category: 'accessing'
method: BitmapCharacterSetTest
lastCodePoint
	^ 16r10FFFF
%

category: 'accessing'
method: BitmapCharacterSetTest
nonEmptySet
	^ self setClass newFrom: self characters
%

category: 'accessing'
method: BitmapCharacterSetTest
rangeCharacters
	^ 'abcdefghijklmnopqrstuvwxyz'
%

category: 'accessing'
method: BitmapCharacterSetTest
rangeStart
	^ self rangeCharacters first
%

category: 'accessing'
method: BitmapCharacterSetTest
rangeStop
	^ self rangeCharacters last
%

category: 'accessing'
method: BitmapCharacterSetTest
setClass
	^ BitmapCharacterSet
%

category: 'tests'
method: BitmapCharacterSetTest
testAdd
	| set |

	set := self emptySet.
	self charactersDo: [:each |
		self
			deny: (set includes: each);
			assert: (set add: each) = each;
			assert: (set includes: each);
			assert: (set add: each) = each;
			assert: (set includes: each)].
%

category: 'tests'
method: BitmapCharacterSetTest
testAddRangeFromTo
	| set |

	set := self emptySet.
	self "empty range, because from > to"
		assert: (set addRangeFrom: self rangeStop to: self rangeStart) == set;
		assert: set isEmpty.

	self
		assert: (set addRangeFrom: self rangeStart to: self rangeStop) == set;
		assert: set = (self setClass newFrom: self rangeCharacters).

	set := self emptySet.
	self
		assert: (set addRangeFrom: self rangeStart to: self rangeStart) == set;
		assert: set = (self setClass with: self rangeStart).
%

category: 'tests'
method: BitmapCharacterSetTest
testByteCharactersDo
	| set enumerated |

	set := self emptySet.
	enumerated := OrderedCollection new.

	set byteCharactersDo: [:each | enumerated addLast: each].
	self assert: enumerated isEmpty.

	set addAll: self characters.
	set byteCharactersDo: [:each | enumerated addLast: each].
	self assert: enumerated notEmpty.
	enumerated withIndexDo: [:each :i |
		self
			assert: each asciiValue < 256;
			assert: each = (self characters at: i)].
%

category: 'tests'
method: BitmapCharacterSetTest
testCapacity
	"Since the bitmap is allocated in bytes, the last byte can have excess capacity
	even when a specific capacity is specified."

	self
		assert: (self setClass new: 0) capacity = 256;
		assert: (self setClass new: 256) capacity = 256.
	257 to: 264 do: [:i |
		self assert: (self setClass new: i) capacity = 264].
	265 to: 272 do: [:i |
		self assert: (self setClass new: i) capacity = 272].
%

category: 'tests'
method: BitmapCharacterSetTest
testComplement
	| set complement |

	set := self nonEmptySet.
	complement := set complement.
	self deny: set = complement.
	self charactersDo: [:each |
		self
			assert: (set includes: each);
			deny: (complement includes: each)].
	self absentCharactersDo: [:each |
		self
			deny: (set includes: each);
			assert: (complement includes: each)].

	self assert: complement complement = set.
%

category: 'tests'
method: BitmapCharacterSetTest
testConcatenation
	| set |

	set := self emptySet.
	self
		assertSet: set, self nonEmptySet
		copiedFrom: set
		equals: self nonEmptySet.

	set := self nonEmptySet.
	self
		assertSet: set, self emptySet
		copiedFrom: set
		equals: self nonEmptySet.
	self
		assertSet: set, self nonEmptySet
		copiedFrom: set
		equals: self nonEmptySet.
%

category: 'tests'
method: BitmapCharacterSetTest
testCopy
	| set |

	set := self emptySet.
	self
		assertSet: set copy
		copiedFrom: set
		equals: self emptySet.

	set := self nonEmptySet.
	self
		assertSet: set copy
		copiedFrom: set
		equals: self nonEmptySet.
%

category: 'tests'
method: BitmapCharacterSetTest
testCopyEmpty
	| set |

	set := self emptySet.
	self
		assertSet: set copyEmpty
		copiedFrom: set
		equals: self emptySet.

	set := self nonEmptySet.
	self
		assertSet: set copyEmpty
		copiedFrom: set
		equals: self emptySet.
%

category: 'tests'
method: BitmapCharacterSetTest
testDo
	| set enumerated |

	set := self emptySet.
	enumerated := OrderedCollection new.

	set do: [:each | enumerated addLast: each].
	self assert: enumerated isEmpty.

	set addAll: self characters.
	set do: [:each | enumerated addLast: each].
	self assert: enumerated size = self characters size.
	enumerated
		with: self characters
		do: [:enumeratedChar :expectedChar |
			self assert: enumeratedChar = expectedChar]
%

category: 'tests'
method: BitmapCharacterSetTest
testEquals
	self
		assert: self emptySet = self emptySet;
		assert: self nonEmptySet = self nonEmptySet;
		deny: self emptySet = self nonEmptySet;
		deny: self nonEmptySet = self emptySet
%

category: 'tests'
method: BitmapCharacterSetTest
testHash
	self
		assert: self emptySet hash = self emptySet hash;
		assert: self nonEmptySet hash = self nonEmptySet hash
%

category: 'tests'
method: BitmapCharacterSetTest
testHasWideCharacters
	| set |

	set := self emptySet.
	self deny: set hasWideCharacters.

	set add: 255 asCharacter.
	self deny: set hasWideCharacters.

	set add: 256 asCharacter.
	self assert: set hasWideCharacters.

	set remove: 256 asCharacter.
	self deny: set hasWideCharacters.
%

category: 'tests'
method: BitmapCharacterSetTest
testIncludes
	| set |

	set := self emptySet.
	self
		charactersDo: [:each | self deny: (set includes: each)];
		absentCharactersDo: [:each | self deny: (set includes: each)].

	set := self nonEmptySet.
	self
		charactersDo: [:each | self assert: (set includes: each)];
		absentCharactersDo: [:each | self deny: (set includes: each)].
%

category: 'tests'
method: BitmapCharacterSetTest
testIncludesRangeFromTo
	| set |

	set := self emptySet.
	self rangeCharacters do: [:each |
		self
			deny: (set includesRangeFrom: self rangeStart to: self rangeStop);
			assert: (set includesRangeFrom: self rangeStop to: self rangeStart).
		set add: each].
	self
		assert: (set includesRangeFrom: self rangeStart to: self rangeStop);
		assert: (set includesRangeFrom: self rangeStop to: self rangeStart).
%

category: 'tests'
method: BitmapCharacterSetTest
testMaxCapacity
	| maxCapacity set |

	maxCapacity := self lastCodePoint + 1.

	set := self setClass new: maxCapacity.
	self assert: set capacity = maxCapacity.

	set := self setClass new: maxCapacity + 1.
	self assert: set capacity = maxCapacity.

	set := self setClass new: maxCapacity * 2.
	self assert: set capacity = maxCapacity.
%

category: 'tests'
method: BitmapCharacterSetTest
testMaxCharacter
	| set |

	set := self emptySet.
	self
		shouldnt: [set add: self lastCodePoint asCharacter]
		raise: Error.
	self assert: (set includes: self lastCodePoint asCharacter).
	self
		should: [set add: (self lastCodePoint + 1) asCharacter]
		raise: Error.
%

category: 'tests'
method: BitmapCharacterSetTest
testNewFrom
	| set newSet |

	set := self setClass newFrom: self characters.
	self assert: set class == self setClass.
	self charactersDo: [:each | self assert: (set includes: each)].

	newSet := self setClass newFrom: set.
	self
		assert: newSet = set;
		deny: newSet == set.
%

category: 'tests'
method: BitmapCharacterSetTest
testRemoveAll
	| set capacity byteCharactersSize wideCharactersSize|

	set := self nonEmptySet.
	capacity := set capacity.
	byteCharactersSize := set byteCharacters size.
	wideCharactersSize := set wideCharacters size.
	self
		assert: set removeAll == set;
		assert: set size = 0;
		assert: set capacity = capacity;
		assert: set byteCharacters size = byteCharactersSize;
		assert: (set byteCharacters allSatisfy: [:each | each = false]);
		assert: set wideCharacters size = wideCharactersSize;
		assert: (set wideCharacters allSatisfy: [:each | each = 0]).
%

category: 'tests'
method: BitmapCharacterSetTest
testRemoveIfAbsent
	| set |

	set := self nonEmptySet.
	self absentCharactersDo: [:each |
		self assert:
			(set
				remove: each
				ifAbsent: [#absent]) = #absent].
	self charactersDo: [:each |
		self assert:
			(set
				remove: each
				ifAbsent: [self fail]) = each.
		self assert:
			(set
				remove: each
				ifAbsent: [#absent]) = #absent].
%

category: 'tests'
method: BitmapCharacterSetTest
testRemoveRangeFromTo
	| set |

	set := self emptySet.
	self "empty range, because from > to"
		assert: (set removeRangeFrom: self rangeStop to: self rangeStart) == set;
		assert: set isEmpty.

	set addRangeFrom: self rangeStart to: self rangeStop.
	self
		assert: (set removeRangeFrom: self rangeStart to: self rangeStop) == set;
		assert: set isEmpty.

	self rangeCharacters do: [:each |
		set := self setClass newFrom: self rangeCharacters.
		self
			assert: (set removeRangeFrom: each to: each) == set;
			assert:
				set =
					(self setClass newFrom: (self rangeCharacters copyWithout: each)).
		self
			should: [set removeRangeFrom: each to: each]
			raise: Error].
%

category: 'tests'
method: BitmapCharacterSetTest
testSize
	| set size |

	set := self emptySet.
	size := 0.
	self charactersDo: [:each |
		self assert: set size = size.
		set add: each.
		size := size + 1.
		self assert: set size = size.

		"Adding the same character shouldn't alter the size"
		set add: each.
		self assert: set size = size.].

	self charactersDo: [:each |
		set remove: each.
		size := size - 1.
		self assert: set size = size].	
%

category: 'tests'
method: BitmapCharacterSetTest
testWideCharacters
	0 to: 7 do: [:i | | set character |
		set := self setClass new.
		character := (256 + i) asCharacter.
		self assert: set wideCharacters isNil.
		set add: character.
		self assert: set wideCharacters first = (16r80 bitShift: i negated).
		set remove: character.
		self assert: set wideCharacters first = 0].
	0 to: 7 do: [:i | | set character |
		set := self setClass new.
		character := (256 + 8 + i) asCharacter.
		self assert: set wideCharacters isNil.
		set add: character.
		self assert: set wideCharacters second = (16r80 bitShift: i negated).
		set remove: character.
		self assert: set wideCharacters second = 0]
%

category: 'tests'
method: BitmapCharacterSetTest
testWideCharactersDo
	| set enumerated wideCharOffset |

	set := self emptySet.
	enumerated := OrderedCollection new.

	set wideCharactersDo: [:each | enumerated addLast: each].
	self assert: enumerated isEmpty.

	set addAll: self characters.
	set wideCharactersDo: [:each | enumerated addLast: each].
	self assert: enumerated notEmpty.
	wideCharOffset :=
		(self characters findFirst: [:each | each asciiValue >= 256]) - 1.
	enumerated withIndexDo: [:each :i |
		self
			assert: each asciiValue >= 256;
			assert: each = (self characters at: wideCharOffset + i)].
%


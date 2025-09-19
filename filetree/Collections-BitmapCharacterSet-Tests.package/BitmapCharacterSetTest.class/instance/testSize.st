tests
testSize
	| set size |

	set := self emptySet.
	size := 0.
	self charactersDo: [ :each |
		self assert: set size = size.
		set add: each.
		size := size + 1.
		self assert: set size = size.
		"Adding the same character shouldn't alter the size"
		set add: each.
		self assert: set size = size ].

	self charactersDo: [ :each |
		set remove: each.
		size := size - 1.
		self assert: set size = size ].	
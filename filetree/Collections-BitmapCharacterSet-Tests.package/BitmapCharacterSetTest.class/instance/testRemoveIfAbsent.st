tests
testRemoveIfAbsent
	| set |

	set := self nonEmptySet.
	self absentCharactersDo: [ :each |
		self
			assert:(set remove: each ifAbsent: [ #absent ]) = #absent ].
	self charactersDo: [ :each |
		self
			assert: (set remove: each ifAbsent: [ self fail ]) = each.
		self
			assert: (set remove: each ifAbsent: [ #absent ]) = #absent ].
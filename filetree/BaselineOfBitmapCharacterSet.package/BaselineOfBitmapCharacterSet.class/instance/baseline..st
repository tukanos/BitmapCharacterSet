baselines
baseline: spec
	<baseline>
	
	spec for: #common do: [ 
		"Packages and Dependencies"
		spec 
			package: 'Collections-BitmapCharacterSet-Core';
			package: 'Collections-BitmapCharacterSet-Tests' with: [ spec requires: 'Collections-BitmapCharacterSet-Core' ].
			
		"Groups"	
		spec				
				group: 'Core' with: #('Collections-BitmapCharacterSet-Core');
				group: 'Tests' with: #('Collections-BitmapCharacterSet-Tests');
				group: 'CI' with: #('Tests');
				group: 'all' with: #('Core' 'Tests');
				group: 'default' with: #('all')	
	]

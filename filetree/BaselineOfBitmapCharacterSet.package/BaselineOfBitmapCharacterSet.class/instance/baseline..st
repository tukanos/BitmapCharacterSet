baselines
baseline: spec
	<baseline>
	
	spec for: #common do: [ 
		"Packages and Dependencies"
		spec 
			package: 'Collections-BitmapCharacterSet-Base';
			package: 'Collections-BitmapCharacterSet-Tests' with: [ spec requires: 'Collections-BitmapCharacterSet-Base' ].
			
		"Groups"	
		spec				
				group: 'Core' with: #('Collections-BitmapCharacterSet-Base');
				group: 'Tests' with: #('Collections-BitmapCharacterSet-Tests');
				group: 'CI' with: #('Tests');
				group: 'all' with: #('Core' 'Tests');
				group: 'default' with: #('all')	
	]

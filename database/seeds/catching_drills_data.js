// catching_drills_data.js
// Complete library of 31 catching drills for AI coach app
// Each drill includes: instructions, equipment, difficulty, coaching points

const catchingDrillsData = [
    // =============================================================================
    // RECEIVING DRILLS (12 drills) - Focus on glove work and presentation
    // =============================================================================
    {
        id: 'receiving_001',
        name: 'Tennis Ball Wall Bounces',
        category: 'receiving',
        sub_category: 'glove_move',
        difficulty: 1,
        duration_minutes: 3,
        equipment_required: ['tennis_balls'],
        equipment_tier: 'basic',
        age_range: [12, 25],
        instructions: [
            'Stand 3 feet from a wall in proper catching stance',
            'Throw tennis ball against wall with moderate force',
            'Catch ball with proper glove positioning as it bounces back',
            'Focus on moving glove to ball rather than moving body',
            'Repeat for designated time, alternating high and low throws'
        ],
        coaching_points: [
            'Keep glove relaxed and fingers pointing up for high balls',
            'Turn glove down with fingers pointing down for low balls',
            'Move glove smoothly to ball - no stabbing motions',
            'Keep body quiet and let glove do the work'
        ],
        video_url: 'https://example.com/tennis-ball-wall-bounces',
        common_mistakes: [
            'Moving entire body instead of just glove',
            'Stabbing at ball instead of smooth glove movement',
            'Wrong glove orientation for ball height'
        ]
    },
    {
        id: 'receiving_002',
        name: 'Knee Down Framing',
        category: 'receiving',
        sub_category: 'presentation',
        difficulty: 2,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [14, 25],
        instructions: [
            'Get in one-knee-down position (throwing side knee up)',
            'Have partner toss tennis balls to various locations around strike zone',
            'Focus on receiving ball quietly and holding position',
            'Present each pitch to imaginary umpire for 2 seconds',
            'Emphasize smooth glove movement and stillness after catch'
        ],
        coaching_points: [
            'Receive ball with soft hands - let ball come to glove',
            'Hold presentation position to show umpire the strike',
            'Keep glove in zone after catch - don\'t pull away',
            'Minimize glove movement during presentation'
        ],
        video_url: 'https://example.com/knee-down-framing',
        common_mistakes: [
            'Pulling glove back immediately after catch',
            'Too much glove movement during presentation',
            'Not holding position long enough for umpire to see'
        ]
    },
    {
        id: 'receiving_003',
        name: 'Glove Load Drill',
        category: 'receiving',
        sub_category: 'glove_load',
        difficulty: 2,
        duration_minutes: 3,
        equipment_required: ['tennis_balls'],
        equipment_tier: 'basic',
        age_range: [12, 25],
        instructions: [
            'Start in proper catching stance with glove extended',
            'Partner tosses ball to glove location',
            'Focus on "loading" the glove by closing it smoothly around ball',
            'Hold ball in glove for 1 second before releasing',
            'Repeat 15-20 times focusing on smooth glove closure'
        ],
        coaching_points: [
            'Close glove from outside fingers inward',
            'Don\'t snap glove shut - smooth closure',
            'Keep thumb and pinky moving together',
            'Feel ball settle into pocket of glove'
        ],
        video_url: 'https://example.com/glove-load-drill',
        common_mistakes: [
            'Snapping glove shut too quickly',
            'Not feeling ball settle in pocket',
            'Inconsistent glove closure technique'
        ]
    },
    {
        id: 'receiving_004',
        name: 'Setup Position Practice',
        category: 'receiving',
        sub_category: 'setups',
        difficulty: 1,
        duration_minutes: 4,
        equipment_required: ['catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [12, 25],
        instructions: [
            'Set up behind home plate in proper catching stance',
            'Practice transitioning between different setup positions',
            'Work on: balanced, slightly inside, slightly outside setups',
            'Hold each position for 30 seconds to build muscle memory',
            'Focus on comfort and balance in each setup'
        ],
        coaching_points: [
            'Feet shoulder-width apart with weight on balls of feet',
            'Keep knees inside feet for better mobility',
            'Maintain straight back with slight forward lean',
            'Glove and bare hand should be relaxed and ready'
        ],
        video_url: 'https://example.com/setup-position-practice',
        common_mistakes: [
            'Too narrow or too wide foot positioning',
            'Sitting back on heels instead of balls of feet',
            'Tense muscles instead of relaxed readiness'
        ]
    },
    {
        id: 'receiving_005',
        name: 'Borderline Pitch Framing',
        category: 'receiving',
        sub_category: 'presentation',
        difficulty: 4,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [16, 25],
        instructions: [
            'Set up behind home plate in game position',
            'Partner throws borderline strikes (edges of strike zone)',
            'Focus on subtle movements to present strikes favorably',
            'Work on: bottom of zone, corners, just off the plate',
            'Practice "sticking" pitches without obvious movement'
        ],
        coaching_points: [
            'Minimal glove movement - let ball travel to glove',
            'Slight pause before any glove movement',
            'Turn borderline balls into strikes with quiet presentation',
            'Don\'t overframe - subtle movements only'
        ],
        video_url: 'https://example.com/borderline-pitch-framing',
        common_mistakes: [
            'Too much obvious glove movement',
            'Trying to frame obvious balls',
            'Moving glove too quickly after catch'
        ]
    },
    {
        id: 'receiving_006',
        name: 'Rhythm and Timing',
        category: 'receiving',
        sub_category: 'glove_move',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [14, 25],
        instructions: [
            'Partner throws with consistent rhythm and timing',
            'Focus on matching glove movement to ball flight',
            'Work on smooth, timed glove positioning',
            'Practice receiving balls at different speeds',
            'Emphasize fluid motion from setup to catch'
        ],
        coaching_points: [
            'Start glove movement as ball leaves hand',
            'Arrive at catch point same time as ball',
            'Smooth acceleration and deceleration of glove',
            'Maintain rhythm even with different ball speeds'
        ],
        video_url: 'https://example.com/rhythm-and-timing',
        common_mistakes: [
            'Glove movement too early or too late',
            'Jerky or inconsistent glove movement',
            'Not adjusting timing for different ball speeds'
        ]
    },
    {
        id: 'receiving_007',
        name: 'Low Strike Presentation',
        category: 'receiving',
        sub_category: 'presentation',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [15, 25],
        instructions: [
            'Focus specifically on low strikes in the zone',
            'Partner throws balls at bottom of strike zone',
            'Practice receiving low strikes without dropping glove',
            'Work on presenting low strikes as strikes, not balls',
            'Emphasize proper glove angle and stillness'
        ],
        coaching_points: [
            'Keep glove fingers pointing down for low balls',
            'Don\'t drop glove below the zone',
            'Receive ball and hold position in strike zone',
            'Slight upward pressure after catch to show strike'
        ],
        video_url: 'https://example.com/low-strike-presentation',
        common_mistakes: [
            'Dropping glove too low and making strikes look like balls',
            'Not holding presentation position long enough',
            'Wrong glove angle for low pitches'
        ]
    },
    {
        id: 'receiving_008',
        name: 'Corner Pitch Work',
        category: 'receiving',
        sub_category: 'presentation',
        difficulty: 4,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [16, 25],
        instructions: [
            'Work specifically on corner pitches (inside and outside)',
            'Partner alternates throwing to inside and outside corners',
            'Practice subtle movements to present corners as strikes',
            'Focus on not reaching across plate or pulling inside',
            'Work on consistent presentation regardless of location'
        ],
        coaching_points: [
            'Stay centered over plate - don\'t lean to reach',
            'Let ball come to you on outside corner',
            'Don\'t pull inside corner pitches across plate',
            'Consistent glove presentation regardless of location'
        ],
        video_url: 'https://example.com/corner-pitch-work',
        common_mistakes: [
            'Leaning or reaching to outside corner',
            'Pulling inside pitches across the plate',
            'Different presentation technique for different locations'
        ]
    },
    {
        id: 'receiving_009',
        name: 'Quiet Body Receiving',
        category: 'receiving',
        sub_category: 'glove_move',
        difficulty: 2,
        duration_minutes: 3,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [13, 25],
        instructions: [
            'Focus on keeping body completely still while receiving',
            'Partner throws to various locations around strike zone',
            'Move only glove to ball - body stays in setup position',
            'Practice receiving without any body movement or adjustment',
            'Emphasize glove-only movement for all locations'
        ],
        coaching_points: [
            'Plant feet and don\'t move them during drill',
            'Keep torso and shoulders still',
            'All adjustment comes from glove and arm movement',
            'Maintain balance throughout receiving motion'
        ],
        video_url: 'https://example.com/quiet-body-receiving',
        common_mistakes: [
            'Moving body to help reach ball',
            'Shifting weight or stepping during catch',
            'Shoulder or torso movement during receiving'
        ]
    },
    {
        id: 'receiving_010',
        name: 'Glove Angle Variations',
        category: 'receiving',
        sub_category: 'glove_move',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [14, 25],
        instructions: [
            'Practice proper glove angles for different ball locations',
            'High balls: fingers up, thumb on top',
            'Low balls: fingers down, thumb on bottom',
            'Middle balls: glove vertical, thumb to side',
            'Work on smooth transitions between angles'
        ],
        coaching_points: [
            'Glove angle should match ball height',
            'Smooth transition - no awkward positioning',
            'Fingers always point toward ball flight',
            'Practice until angle changes become automatic'
        ],
        video_url: 'https://example.com/glove-angle-variations',
        common_mistakes: [
            'Wrong glove angle for ball height',
            'Awkward or uncomfortable glove positions',
            'Not changing angle smoothly'
        ]
    },
    {
        id: 'receiving_011',
        name: 'Soft Hands Development',
        category: 'receiving',
        sub_category: 'glove_load',
        difficulty: 2,
        duration_minutes: 3,
        equipment_required: ['tennis_balls'],
        equipment_tier: 'basic',
        age_range: [12, 25],
        instructions: [
            'Partner tosses balls with varying speeds and locations',
            'Focus on receiving each ball with maximum softness',
            'Practice "giving" with the ball upon impact',
            'Work on absorbing ball energy rather than fighting it',
            'Emphasize relaxed hands and arms during catch'
        ],
        coaching_points: [
            'Relax hands and arms before ball arrives',
            'Let ball come to glove - don\'t attack it',
            'Slight give backward upon ball contact',
            'Think of hands as shock absorbers'
        ],
        video_url: 'https://example.com/soft-hands-development',
        common_mistakes: [
            'Tense hands and arms',
            'Fighting the ball instead of receiving it',
            'No give or absorption upon contact'
        ]
    },
    {
        id: 'receiving_012',
        name: 'Game Speed Receiving',
        category: 'receiving',
        sub_category: 'setups',
        difficulty: 5,
        duration_minutes: 6,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [16, 25],
        instructions: [
            'Partner throws at game speed and intensity',
            'Work on receiving in realistic game situations',
            'Practice calling pitches and receiving them',
            'Focus on maintaining technique under pressure',
            'Include borderline pitches and difficult locations'
        ],
        coaching_points: [
            'Maintain all fundamental techniques at game speed',
            'Don\'t sacrifice technique for speed',
            'Stay calm and focused under pressure',
            'Trust your training and muscle memory'
        ],
        video_url: 'https://example.com/game-speed-receiving',
        common_mistakes: [
            'Abandoning technique under pressure',
            'Rushing through receiving fundamentals',
            'Not staying calm with increased intensity'
        ]
    },

    // =============================================================================
    // THROWING DRILLS (8 drills) - Focus on footwork, exchange, and accuracy
    // =============================================================================
    {
        id: 'throwing_001',
        name: 'Quick Release Drill',
        category: 'throwing',
        sub_category: 'exchange',
        difficulty: 2,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [13, 25],
        instructions: [
            'Start in receiving position with ball in glove',
            'Practice quick transfer from glove to bare hand',
            'Focus on finding ball quickly in glove',
            'Work on consistent grip and hand positioning',
            'Emphasize speed without sacrificing control'
        ],
        coaching_points: [
            'Find ball with bare hand, don\'t dump it out',
            'Grip ball across seams for better control',
            'Keep transfer close to body',
            'Two hands work together - glove feeds bare hand'
        ],
        video_url: 'https://example.com/quick-release-drill',
        common_mistakes: [
            'Dumping ball out of glove instead of controlled transfer',
            'Taking too long to find ball in glove',
            'Inconsistent grip on ball'
        ]
    },
    {
        id: 'throwing_002',
        name: 'Footwork Fundamentals',
        category: 'throwing',
        sub_category: 'footwork',
        difficulty: 2,
        duration_minutes: 4,
        equipment_required: ['catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [13, 25],
        instructions: [
            'Practice basic throwing footwork without ball',
            'Right foot steps toward second base',
            'Left foot follows and plants for throwing position',
            'Work on quick, efficient steps',
            'Practice until footwork becomes automatic'
        ],
        coaching_points: [
            'Right foot steps first, directly toward target',
            'Keep steps short and quick',
            'Left foot plants with body in throwing position',
            'Maintain balance throughout footwork'
        ],
        video_url: 'https://example.com/footwork-fundamentals',
        common_mistakes: [
            'Taking too big of steps',
            'Wrong foot leading to second base',
            'Losing balance during footwork'
        ]
    },
    {
        id: 'throwing_003',
        name: 'Exchange and Throw',
        category: 'throwing',
        sub_category: 'exchange',
        difficulty: 3,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [14, 25],
        instructions: [
            'Combine receiving, exchange, and throwing in one motion',
            'Partner throws ball to simulate pitch',
            'Receive, exchange, and throw to second base',
            'Focus on smooth transition between all phases',
            'Time entire sequence for improvement'
        ],
        coaching_points: [
            'Start transfer as you\'re receiving the ball',
            'Footwork begins during the exchange',
            'Smooth, continuous motion throughout',
            'Don\'t pause between phases'
        ],
        video_url: 'https://example.com/exchange-and-throw',
        common_mistakes: [
            'Pausing between receiving and throwing',
            'Starting footwork too late',
            'Rushing one phase and sacrificing others'
        ]
    },
    {
        id: 'throwing_004',
        name: 'Accuracy Challenge',
        category: 'throwing',
        sub_category: 'accuracy',
        difficulty: 3,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate', 'cones'],
        equipment_tier: 'premium',
        age_range: [14, 25],
        instructions: [
            'Set up cones or targets at second base',
            'Practice throwing to specific spots',
            'Work on: chest-high, on the bag, glove-side',
            'Keep track of accuracy percentage',
            'Focus on consistent target hitting'
        ],
        coaching_points: [
            'Pick specific target and focus on it',
            'Follow through toward your target',
            'Consistent arm angle and release point',
            'Quality over speed - accuracy first'
        ],
        video_url: 'https://example.com/accuracy-challenge',
        common_mistakes: [
            'Not picking specific target',
            'Rushing throw and sacrificing accuracy',
            'Inconsistent arm angle'
        ]
    },
    {
        id: 'throwing_005',
        name: 'Arm Strength Building',
        category: 'throwing',
        sub_category: 'arm_strength',
        difficulty: 3,
        duration_minutes: 6,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [15, 25],
        instructions: [
            'Progressive throwing at increasing distances',
            'Start close and gradually move back',
            'Focus on proper mechanics at all distances',
            'Work on maximum effort throws with good form',
            'Include long toss if space permits'
        ],
        coaching_points: [
            'Maintain proper throwing mechanics at all distances',
            'Don\'t sacrifice form for distance',
            'Strong finish and follow-through',
            'Build up intensity gradually'
        ],
        video_url: 'https://example.com/arm-strength-building',
        common_mistakes: [
            'Sacrificing mechanics for distance',
            'Not building up intensity gradually',
            'Poor follow-through on maximum effort throws'
        ]
    },
    {
        id: 'throwing_006',
        name: 'Stolen Base Simulation',
        category: 'throwing',
        sub_category: 'footwork',
        difficulty: 4,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [15, 25],
        instructions: [
            'Simulate game situations with runners stealing',
            'Partner varies timing and location of pitches',
            'Practice throwing to second base under pressure',
            'Work on different pitch locations and counts',
            'Focus on quick decision making'
        ],
        coaching_points: [
            'Trust your footwork under pressure',
            'Make strong, accurate throws',
            'Quick decision on whether to throw',
            'Maintain composure in pressure situations'
        ],
        video_url: 'https://example.com/stolen-base-simulation',
        common_mistakes: [
            'Rushing footwork under pressure',
            'Making poor decisions on when to throw',
            'Letting pressure affect throwing mechanics'
        ]
    },
    {
        id: 'throwing_007',
        name: 'Pick-off Throws',
        category: 'throwing',
        sub_category: 'footwork',
        difficulty: 4,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [16, 25],
        instructions: [
            'Practice quick throws to first and third base',
            'Work on different pick-off situations',
            'Focus on deception and quick release',
            'Practice with and without runners',
            'Emphasize accuracy over speed'
        ],
        coaching_points: [
            'Use deception to hide throwing intention',
            'Quick, accurate throws to base',
            'Don\'t telegraph your intentions',
            'Work with pitcher on timing and signals'
        ],
        video_url: 'https://example.com/pick-off-throws',
        common_mistakes: [
            'Telegraphing pick-off attempts',
            'Sacrificing accuracy for speed',
            'Not working with pitcher effectively'
        ]
    },
    {
        id: 'throwing_008',
        name: 'Rapid Fire Throwing',
        category: 'throwing',
        sub_category: 'exchange',
        difficulty: 3,
        duration_minutes: 3,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [14, 25],
        instructions: [
            'Partner rapidly tosses balls for quick throws',
            'Focus on fast exchange and release',
            'Work on maintaining accuracy under speed pressure',
            'Practice handling multiple balls in sequence',
            'Emphasize consistent mechanics'
        ],
        coaching_points: [
            'Maintain proper exchange technique',
            'Don\'t let speed compromise accuracy',
            'Reset quickly between throws',
            'Stay balanced and under control'
        ],
        video_url: 'https://example.com/rapid-fire-throwing',
        common_mistakes: [
            'Rushing exchange and making errors',
            'Not resetting properly between throws',
            'Sacrificing accuracy for speed'
        ]
    },

    // =============================================================================
    // BLOCKING DRILLS (6 drills) - Focus on blocking technique and recovery
    // =============================================================================
    {
        id: 'blocking_001',
        name: 'Basic Blocking Position',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 1,
        duration_minutes: 3,
        equipment_required: ['catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [12, 25],
        instructions: [
            'Practice proper blocking stance without ball',
            'Drop to knees with shins perpendicular to ground',
            'Keep back straight and chest up',
            'Glove between legs, bare hand behind back',
            'Hold position for 30 seconds at a time'
        ],
        coaching_points: [
            'Quick drop to knees, don\'t fall backward',
            'Keep chest up and forward',
            'Chin down to protect neck',
            'Glove fills space between legs'
        ],
        video_url: 'https://example.com/basic-blocking-position',
        common_mistakes: [
            'Falling backward instead of dropping straight down',
            'Letting chest cave in',
            'Not getting glove between legs'
        ]
    },
    {
        id: 'blocking_002',
        name: 'Tennis Ball Blocking',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 2,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [13, 25],
        instructions: [
            'Partner bounces tennis balls in dirt for blocking practice',
            'Focus on getting body in front of ball',
            'Work on keeping ball in front of body',
            'Practice recovery after each block',
            'Emphasize proper blocking form'
        ],
        coaching_points: [
            'Get body behind ball, not glove',
            'Keep ball close to body after block',
            'Quick recovery to receiving position',
            'Stay low and athletic'
        ],
        video_url: 'https://example.com/tennis-ball-blocking',
        common_mistakes: [
            'Trying to catch ball instead of block',
            'Not getting body behind ball',
            'Slow recovery after block'
        ]
    },
    {
        id: 'blocking_003',
        name: 'Angle Blocking',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [14, 25],
        instructions: [
            'Practice blocking balls to left and right side',
            'Work on angling body to redirect ball toward pitcher',
            'Focus on keeping ball in front of home plate',
            'Practice quick lateral movement into blocking position',
            'Emphasize proper angle and body positioning'
        ],
        coaching_points: [
            'Angle shoulders to deflect ball toward pitcher',
            'Get body behind ball before angling',
            'Keep ball close to home plate',
            'Quick lateral movement to ball'
        ],
        video_url: 'https://example.com/angle-blocking',
        common_mistakes: [
            'Not angling body properly',
            'Letting ball get too far from plate',
            'Slow lateral movement'
        ]
    },
    {
        id: 'blocking_004',
        name: 'Bare Hand Blocking',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 2,
        duration_minutes: 3,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [13, 25],
        instructions: [
            'Practice blocking with bare hand behind back',
            'Focus on using chest protector and shins to block',
            'Work on keeping bare hand safe and protected',
            'Emphasize body positioning over glove work',
            'Practice with various ball locations'
        ],
        coaching_points: [
            'Keep bare hand behind back and protected',
            'Use chest and shins as primary blocking tools',
            'Don\'t reach with glove - use body',
            'Keep bare hand safe from foul tips'
        ],
        video_url: 'https://example.com/bare-hand-blocking',
        common_mistakes: [
            'Exposing bare hand to ball',
            'Relying too much on glove',
            'Not using body effectively'
        ]
    },
    {
        id: 'blocking_005',
        name: 'Block and Recover',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 4,
        duration_minutes: 5,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [15, 25],
        instructions: [
            'Block ball then quickly recover to find and secure it',
            'Practice blocking followed by immediate ball recovery',
            'Work on locating ball quickly after block',
            'Focus on securing ball and getting ready for next play',
            'Simulate game situations with runners'
        ],
        coaching_points: [
            'Block first, then immediately look for ball',
            'Get to ball quickly but under control',
            'Secure ball properly - don\'t rush',
            'Be ready for next play after securing ball'
        ],
        video_url: 'https://example.com/block-and-recover',
        common_mistakes: [
            'Looking for ball instead of blocking first',
            'Rushing to ball and not securing it',
            'Not being ready for next play'
        ]
    },
    {
        id: 'blocking_006',
        name: 'Continuous Blocking',
        category: 'blocking',
        sub_category: 'blocking_overall',
        difficulty: 4,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [15, 25],
        instructions: [
            'Partner throws multiple balls in sequence for blocking',
            'Practice blocking multiple balls without rest',
            'Focus on maintaining proper form throughout',
            'Work on quick reset between blocks',
            'Build endurance and consistency'
        ],
        coaching_points: [
            'Maintain proper blocking form throughout',
            'Quick reset between blocks',
            'Stay mentally focused on each block',
            'Don\'t let fatigue affect technique'
        ],
        video_url: 'https://example.com/continuous-blocking',
        common_mistakes: [
            'Technique breakdown as fatigue sets in',
            'Not resetting properly between blocks',
            'Losing focus during continuous work'
        ]
    },

    // =============================================================================
    // EDUCATION DRILLS (5 drills) - Focus on game management and communication
    // =============================================================================
    {
        id: 'education_001',
        name: 'Pitch Recognition Study',
        category: 'education',
        sub_category: 'pitch_calling',
        difficulty: 2,
        duration_minutes: 5,
        equipment_required: ['tennis_balls'],
        equipment_tier: 'basic',
        age_range: [14, 25],
        instructions: [
            'Partner throws different pitch types at various speeds',
            'Practice identifying pitch type and location',
            'Work on recognizing spin and movement patterns',
            'Study how different pitches look out of hand',
            'Practice calling pitches before they arrive'
        ],
        coaching_points: [
            'Watch pitcher\'s hand and release point',
            'Identify spin and movement early',
            'Learn to recognize different pitch grips',
            'Practice makes pitch recognition automatic'
        ],
        video_url: 'https://example.com/pitch-recognition-study',
        common_mistakes: [
            'Not watching release point closely enough',
            'Focusing on result instead of spin and movement',
            'Not studying enough different pitch types'
        ]
    },
    {
        id: 'education_002',
        name: 'Situational Calling Practice',
        category: 'education',
        sub_category: 'pitch_calling',
        difficulty: 4,
        duration_minutes: 6,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [16, 25],
        instructions: [
            'Practice calling pitches in different game situations',
            'Work on: 2-strike counts, bases loaded, steal situations',
            'Focus on strategic thinking and pitch sequencing',
            'Consider batter strengths/weaknesses in call selection',
            'Practice communicating calls clearly to pitcher'
        ],
        coaching_points: [
            'Think about what pitch gives best chance for success',
            'Consider count, situation, and batter tendencies',
            'Have a plan but be ready to adjust',
            'Clear communication is essential'
        ],
        video_url: 'https://example.com/situational-calling-practice',
        common_mistakes: [
            'Not considering game situation',
            'Being too predictable with pitch selection',
            'Poor communication with pitcher'
        ]
    },
    {
        id: 'education_003',
        name: 'Scouting Report Application',
        category: 'education',
        sub_category: 'scouting_reports',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear'],
        equipment_tier: 'intermediate',
        age_range: [15, 25],
        instructions: [
            'Study imaginary scouting reports on different batter types',
            'Practice adjusting pitch calling based on scouting info',
            'Work on: power hitters, contact hitters, high/low ball hitters',
            'Focus on applying scouting knowledge to pitch selection',
            'Practice remembering and using scouting information'
        ],
        coaching_points: [
            'Use scouting info to influence pitch selection',
            'Remember tendencies but be ready to adapt',
            'Combine scouting with what you see in game',
            'Don\'t overthink - trust the information'
        ],
        video_url: 'https://example.com/scouting-report-application',
        common_mistakes: [
            'Ignoring scouting information',
            'Over-relying on reports without adapting',
            'Not remembering key tendencies'
        ]
    },
    {
        id: 'education_004',
        name: 'Umpire Communication',
        category: 'education',
        sub_category: 'umpire_relations',
        difficulty: 2,
        duration_minutes: 3,
        equipment_required: ['catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [14, 25],
        instructions: [
            'Practice proper communication and positioning with umpire',
            'Work on: setup position, giving umpire clear view',
            'Practice respectful communication about calls',
            'Focus on building positive relationship with umpire',
            'Work on professional demeanor throughout game'
        ],
        coaching_points: [
            'Give umpire best possible view of pitch',
            'Be respectful in all communications',
            'Professional demeanor helps get close calls',
            'Never argue balls and strikes'
        ],
        video_url: 'https://example.com/umpire-communication',
        common_mistakes: [
            'Blocking umpire\'s view of pitch',
            'Arguing or showing up umpire',
            'Not building positive relationship'
        ]
    },
    {
        id: 'education_005',
        name: 'Pitcher Communication',
        category: 'education',
        sub_category: 'pitcher_relations',
        difficulty: 3,
        duration_minutes: 4,
        equipment_required: ['tennis_balls', 'catchers_gear', 'home_plate'],
        equipment_tier: 'advanced',
        age_range: [15, 25],
        instructions: [
            'Practice clear signal giving and communication with pitcher',
            'Work on: signs, location requests, mound visits',
            'Focus on keeping pitcher confident and focused',
            'Practice handling different pitcher personalities',
            'Work on providing encouragement and support'
        ],
        coaching_points: [
            'Clear, consistent signals every time',
            'Positive body language and encouragement',
            'Know when pitcher needs support vs space',
            'Be the leader and steady presence'
        ],
        video_url: 'https://example.com/pitcher-communication',
        common_mistakes: [
            'Unclear or inconsistent signals',
            'Negative body language toward pitcher',
            'Not providing needed support and leadership'
        ]
    }
];

// Export the drill data for use in other files
export default catchingDrillsData;

// Helper function to get drills by category
export function getDrillsByCategory(category) {
    return catchingDrillsData.filter(drill => drill.category === category);
}

// Helper function to get drills by difficulty level
export function getDrillsByDifficulty(difficulty) {
    return catchingDrillsData.filter(drill => drill.difficulty === difficulty);
}

// Helper function to get drills by equipment tier
export function getDrillsByEquipmentTier(equipmentTier) {
    return catchingDrillsData.filter(drill => drill.equipment_tier === equipmentTier);
}

// Helper function to get drills suitable for age
export function getDrillsByAge(age) {
    return catchingDrillsData.filter(drill => 
        age >= drill.age_range[0] && age <= drill.age_range[1]
    );
}

// Helper function to get drill by ID
export function getDrillById(drillId) {
    return catchingDrillsData.find(drill => drill.id === drillId);
}

// Helper function to get drills by sub-category
export function getDrillsBySubCategory(subCategory) {
    return catchingDrillsData.filter(drill => drill.sub_category === subCategory);
}

// Helper function to get drills within duration range
export function getDrillsByDuration(minMinutes, maxMinutes) {
    return catchingDrillsData.filter(drill => 
        drill.duration_minutes >= minMinutes && drill.duration_minutes <= maxMinutes
    );
}

// Helper function to filter drills by multiple criteria
export function filterDrills(criteria) {
    return catchingDrillsData.filter(drill => {
        if (criteria.category && drill.category !== criteria.category) return false;
        if (criteria.difficulty && drill.difficulty !== criteria.difficulty) return false;
        if (criteria.equipment_tier && drill.equipment_tier !== criteria.equipment_tier) return false;
        if (criteria.age && (criteria.age < drill.age_range[0] || criteria.age > drill.age_range[1])) return false;
        if (criteria.max_duration && drill.duration_minutes > criteria.max_duration) return false;
        if (criteria.min_duration && drill.duration_minutes < criteria.min_duration) return false;
        return true;
    });
}

// Summary statistics
export const drillStats = {
    totalDrills: catchingDrillsData.length,
    drillsByCategory: {
        receiving: getDrillsByCategory('receiving').length,
        throwing: getDrillsByCategory('throwing').length,
        blocking: getDrillsByCategory('blocking').length,
        education: getDrillsByCategory('education').length
    },
    drillsByDifficulty: {
        beginner: getDrillsByDifficulty(1).length + getDrillsByDifficulty(2).length,
        intermediate: getDrillsByDifficulty(3).length,
        advanced: getDrillsByDifficulty(4).length + getDrillsByDifficulty(5).length
    },
    equipmentTiers: {
        basic: getDrillsByEquipmentTier('basic').length,
        intermediate: getDrillsByEquipmentTier('intermediate').length,
        advanced: getDrillsByEquipmentTier('advanced').length,
        premium: getDrillsByEquipmentTier('premium').length
    },
    averageDuration: Math.round(
        catchingDrillsData.reduce((sum, drill) => sum + drill.duration_minutes, 0) / catchingDrillsData.length
    ),
    durationRange: {
        shortest: Math.min(...catchingDrillsData.map(drill => drill.duration_minutes)),
        longest: Math.max(...catchingDrillsData.map(drill => drill.duration_minutes))
    }
};
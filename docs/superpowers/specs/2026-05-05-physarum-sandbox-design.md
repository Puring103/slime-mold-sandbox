# Physarum Sandbox Design

## Project Overview

This project is a browser-based slime mold sandbox focused on feeding and simulation rather than science education. The experience centers on observing a digital Physarum-like organism evolve on its own inside a 2D dish while the user arranges food, hazards, and obstacles.

The product goal for the first version is to feel visually close to real slime mold behavior without requiring strict biological accuracy. The user should be able to create interesting scenarios quickly and watch believable outcomes emerge: expansion toward food, detours around hazards, consolidation into thicker veins, branch retraction, sclerotium formation, and revival when conditions improve.

## Product Direction

### Chosen Product Shape

- Product type: interactive feeding and simulation website
- Scope: sandbox only
- No science encyclopedia or educational content in the first version
- No preset challenge levels in the first version
- No temperature or humidity management

### Target Experience

The site should feel like an observation terrarium rather than a click-heavy pet game. The organism evolves automatically. The user controls the scene, not the creature directly.

The main interaction loop is:

1. Place a sclerotium or active inoculation point
2. Add different food sources
3. Add obstacles and harmful substances
4. Adjust simulation speed
5. Observe expansion, routing, retreat, dormancy, and recovery
6. Reset and try a new arrangement

## Visual Direction

The visual style should lean toward a believable slime mold look rather than a scientific graph or a pixel-art game. The organism should appear moist, organic, and slightly pulsing, while still remaining legible as a system.

Visual priorities:

- Organic edges rather than rigid geometry
- Color shifts that communicate organism state
- Vein thickening after successful connections
- Subtle motion that suggests living material
- Clear contrast between food, obstacles, harmful zones, and dormant tissue

## First-Version Feature Set

The first version should stay tightly focused on the simulation sandbox.

### Core Modules

1. Main dish canvas
   - Displays the organism body, veins, leading front, food, hazards, and obstacles

2. Placement tools
   - Sclerotium
   - Food types
   - Harmful substances
   - Obstacles
   - Eraser / clear brush

3. Time controls
   - Pause
   - 1x
   - 5x
   - 20x

4. Observation panel
   - Occupied area
   - Active front count
   - Connected food count
   - Dormant node count
   - Overall activity trend

5. Reset tools
   - Clear all
   - Random scene
   - Re-seed organism

6. Export
   - Screenshot export only for the first version

### Explicitly Out of Scope

- Accounts and persistence
- Community sharing
- Challenge levels and goals
- Educational encyclopedia content
- Full environmental simulation such as temperature or humidity
- Strict biochemical realism
- Multi-colony competition
- Advanced learning or habituation systems

## Simulation Design

### High-Level Model

The simulation should use a hybrid model:

- Field-driven environment
- Front-based growth
- Vein reinforcement and pruning
- Sclerotium state transitions

This is recommended over a pure shortest-path model because it produces more believable exploration. It is also recommended over a full fluid or particle simulation because it is more controllable and feasible for a first version.

### World Representation

The dish should maintain at least six layers of state.

1. Nutrient attraction field
   - Emitted by food sources
   - Diffuses outward and decays over distance and time

2. Hazard / repulsion field
   - Emitted by harmful substances
   - May diffuse or remain localized depending on type

3. Obstacle field
   - Hard obstacles are impassable
   - Soft obstacles increase movement cost and encourage edge-following detours

4. Organism activity field
   - Tracks active front, stable vein, retreating tissue, and sclerotium

5. Vein thickness field
   - Represents the strength and permanence of established transport routes

6. Local resource / flow field
   - A simplified value representing whether a route is worth maintaining

### Organism States

The organism should use four primary states.

1. Active front
   - Brightest visual state
   - Expands into favorable nearby territory

2. Stable vein
   - Slightly darker and thicker
   - Maintains transport between valuable locations

3. Retreating tissue
   - Darkens and thins
   - Indicates low value, starvation, or damage

4. Sclerotium
   - Brown-orange dormant state
   - Static but capable of reactivation if nearby conditions improve

### Update Loop

Each simulation tick should update in this order.

1. Update environmental fields
   - Diffuse and decay nutrient signals
   - Diffuse and decay hazard signals as appropriate

2. Sense local neighborhood
   - Active fronts sample nearby attraction, repulsion, and movement resistance
   - Movement should prefer high reward and low harm, with some randomness to avoid robotic behavior

3. Advance active fronts
   - Expand into favored cells or positions
   - Deposit organism mass in newly occupied space

4. Reinforce successful routes
   - Paths that connect a viable organism core to valuable food become thicker and more stable

5. Retract low-value routes
   - Thin, remote, low-flow, or low-reward branches begin to darken and shrink

6. Apply damage
   - Harmful zones reduce activity, encourage retreat, or trigger state degradation

7. Evaluate dormancy
   - Persistently isolated, starved, or damaged tissue may convert to sclerotium
   - Dormant tissue may reactivate if a strong food gradient appears nearby

## Materials System

The material system should be broad enough to produce interesting behaviors while remaining simple enough to tune.

### Food Types

Three food classes are recommended for the first version.

1. Stable food
   - Medium-high attraction
   - High nutrition capacity
   - Supports long-term thick vein formation

2. Burst food
   - Very high short-term attraction
   - Low lasting capacity
   - Triggers aggressive expansion but is consumed quickly

3. Diffuse food
   - Lower attraction strength
   - Larger radius of influence
   - Useful for remote steering and gradual guidance

Each food type should vary by:

- Attraction strength
- Influence range
- Nutrition capacity
- Decay rate

### Harmful Substances

Harmful substances should not all behave like walls. They should differ by how strongly they repel, weaken, or kill tissue.

Four hazard classes are recommended for the first version.

1. Salt
   - High repulsion
   - Medium damage
   - Good for boundaries and exclusion zones

2. Caffeine / quinine-like repellent
   - High repulsion
   - Low to medium damage
   - Good for forcing reroutes without immediate destruction

3. Bright light patch
   - Medium repulsion
   - Medium damage
   - Functions as a hostile region rather than a chemical object

4. Disinfectant / heavy contamination
   - Medium repulsion
   - High damage
   - Can locally sterilize or kill tissue

Each hazard type should vary by:

- Repulsion strength
- Toxicity
- Influence range
- Decay rate

### Obstacles

Two obstacle types are recommended.

1. Hard obstacle
   - Never passable
   - Used for barriers, walls, stones, or partitions

2. Soft obstacle
   - Passable only with difficulty or over longer time
   - Encourages detours and edge-following behavior

## Sclerotium Design

Sclerotium should be more than a starting marker. It should function as a full organism state.

### Sclerotium Triggers

Local tissue can convert into sclerotium when one or more of the following persist:

- Long-term lack of reachable nutrition
- Separation from valuable transport routes
- Repeated damage from harmful substances
- Sustained low local flow / low network value

### Reactivation

Dormant sclerotium may reactivate when:

- A strong enough nutrient gradient appears nearby
- Adjacent living tissue reconnects to it

This allows the simulation to produce "death and revival" behavior instead of simple deletion.

## Behavior Goals

The simulation should reliably produce the following visible outcomes.

1. Expansion toward nearby or strongly attractive food
2. Detouring around salt, bright light, or repellent zones
3. Wide exploratory branching before network consolidation
4. Thickening of high-value routes after successful connection
5. Retraction and darkening of weak branches
6. Local dormancy in isolated or damaged regions
7. Reactivation when food appears near dormant tissue

If these outcomes are consistently visible, the first version is succeeding.

## Behavioral Rules That Matter Most

### Preserve These

1. Expand faster than you retract
   - Growth should feel exploratory
   - Retraction should feel like delayed judgment

2. Use local choices to create global structure
   - Do not calculate perfect paths directly

3. Let states transition with inertia
   - Connection, thickening, retreat, and dormancy should feel gradual

4. Treat hazards as pressure, not only collision
   - Many hazards should repel first and kill later

### Avoid These

1. Instant best-path selection
2. Uniform radial blob growth with no pruning
3. One-hit deletion for all harmful substances
4. Identical behavior for all foods except color

## Parameter Schema

To keep tuning manageable, materials should share consistent parameter shapes.

### Food Parameters

- `attraction_strength`
- `range`
- `nutrition_capacity`
- `decay_rate`

### Hazard Parameters

- `repulsion_strength`
- `toxicity`
- `range`
- `decay_rate`

### Tissue Parameters

- `mass`
- `activity`
- `thickness`
- `damage`
- `dormancy`

## Time Design

The simulation should support multiple observation speeds without changing rule logic.

- `1x`: best for watching local edge motion and state transitions
- `5x`: default observation speed
- `20x`: best for spotting long-term routing and collapse behavior

The system should keep the same rules across all speed modes and only alter the rate or grouping of simulation ticks.

## Recommended Technical Direction

The recommended implementation direction for the first version is:

- 2D dish simulation
- Scalar fields for attraction, repulsion, and occupancy
- Active-front updates each tick
- Vein reinforcement and low-value pruning
- Dormancy through a simple state machine

This direction best balances realism, performance, clarity, and feasibility.

## Risks and Tradeoffs

### Main Risks

1. Over-simplified growth may look like paint spread rather than organism behavior
2. Over-complex simulation may delay delivery and make tuning difficult
3. Too many material types too early may create balance problems
4. Excessive UI controls may weaken the sandbox immediacy

### Mitigations

1. Focus on front behavior and vein pruning first
2. Use a unified parameter system for all materials
3. Keep the first release to three food types and four hazards
4. Make color and thickness do most of the explanatory work

## Reference Notes

The design above is informed by recurring themes in the literature:

- Physarum expands toward nutrient gradients
- It tends to explore broadly and later consolidate transport networks
- Oscillatory internal flow and delayed structural adaptation are key parts of its behavior
- Food quality changes search strategy
- Harmful stimuli often cause avoidance, slowing, damage, or dormancy rather than instant death

Relevant references:

- Behavioral Ecology 2009: food quality affects search strategy
- PLOS ONE 2014: oscillatory and signaling dynamics
- PLOS ONE 2019: flow and dynamical behavior
- Jeff Jones 2015 papers: transport network approximation and emergent routing
- Frontiers 2015: classic attractants and Physarum behavior background
- Frontiers 2019: organism-scale rhythmic behavior

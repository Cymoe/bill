# Bill-Breeze Product System Vision

## Core Philosophy: Progressive Simplification

The system follows a principle of **progressive simplification** as users move through the workflow:

1. **Price Book (Base Level)** - Contains all the complexity and granular line items
   - Individual materials, labor rates, equipment costs
   - Highly detailed and specific
   - Maximum flexibility but also maximum complexity

2. **Products** - Simplified combinations of price book items
   - Pre-configured combinations of line items
   - Reduced complexity through meaningful groupings
   - Focus on what makes sense to the customer

3. **Packages** - Simplified collections of products
   - Further abstraction from individual components
   - Designed for specific customer scenarios
   - Minimal decision points

4. **Project Templates** - The simplest level
   - Ready-to-use complete solutions
   - One-click project creation
   - Maximum efficiency with minimal complexity

## Key Principles

1. **Simplify at Each Level**
   - Each step up the ladder should remove complexity, not add it
   - Avoid unnecessary filtering steps or decision points
   - The interface should become progressively simpler

2. **Practical Field-Oriented Design**
   - Design for real-world usage, not theoretical organization
   - Category distinctions matter most at the price book level
   - As we move up, focus on customer-facing groupings

3. **One-Way Complexity Flow**
   - Complexity belongs at the bottom of the system
   - Higher levels should shield users from underlying complexity
   - The goal is to reach "one-button simplicity" at the project level

## Implementation Guidelines

- Avoid multi-step filtering processes at higher levels
- Keep interfaces clean and focused on the task at hand
- Always ask: "Does this make the user's job simpler?"
- Remember that perfection is achieved when there is nothing left to remove

## Product Variant System

### Base Products vs. Variants

Products are organized in a hierarchical structure:

1. **Base Products**: Parent products that serve as templates or foundational offerings
   - Marked with `is_base_product: true` in the database
   - Example: "Exterior Door Installation" as a base product

2. **Variants**: Specialized versions of a base product (different grades/options)
   - Marked with `is_base_product: false` in the database
   - Example: "Standard Door Installation", "Premium Door Installation", etc.

### Trade Determination Logic

To simplify the user experience, trades are determined automatically:

1. **For Base Products**:
   - Assign to the trade that the majority of components belong to
   - If there's a tie (same number of components from different trades), use the trade of the most expensive component

2. **For Variants**:
   - Automatically inherit the trade of their parent product
   - This ensures consistency within a product family

### Benefits

- **Consistency**: All variants of a product are in the same trade category
- **Simplified UI**: Users don't need to manually specify trades
- **Improved Organization**: Variants are grouped under base products
- **Better Filtering**: When filtering by trade, all variants appear with their base products

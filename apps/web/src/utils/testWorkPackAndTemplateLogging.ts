import { supabase } from '../lib/supabase';
import { WorkPackService } from '../services/WorkPackService';
import { TemplateService } from '../services/TemplateService';

export async function testWorkPackAndTemplateLogging() {
  console.log('=== TESTING WORK PACK AND TEMPLATE ACTIVITY LOGGING ===\n');
  
  const orgId = localStorage.getItem('selectedOrgId');
  if (!orgId) {
    console.error('No organization ID found');
    return;
  }

  try {
    // 1. Test Work Pack creation
    console.log('1. Testing Work Pack creation...\n');
    
    const testWorkPack = await WorkPackService.create({
      organization_id: orgId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      name: 'Test Work Pack - Activity Logging',
      description: 'Testing activity logging for work packs',
      industry_id: 'test-industry', // You might need to get a real ID
      project_type_id: 'test-project-type', // You might need to get a real ID
      tier: 'standard',
      base_price: 1000,
      is_active: true,
      tasks: [
        {
          title: 'Test Task 1',
          description: 'First test task',
          estimated_hours: 8,
          display_order: 0
        }
      ],
      expenses: [
        {
          description: 'Test Expense',
          amount: 100,
          category: 'Materials',
          display_order: 0
        }
      ]
    });
    
    console.log('✅ Work Pack created:', testWorkPack.id);
    
    // 2. Test Work Pack update
    console.log('\n2. Testing Work Pack update...\n');
    
    const updatedWorkPack = await WorkPackService.update(testWorkPack.id!, {
      name: 'Updated Test Work Pack',
      base_price: 1500,
      organization_id: orgId
    });
    
    console.log('✅ Work Pack updated:', updatedWorkPack.id);
    
    // 3. Test Work Pack duplicate
    console.log('\n3. Testing Work Pack duplication...\n');
    
    const duplicatedWorkPack = await WorkPackService.duplicate(testWorkPack.id!, orgId);
    
    console.log('✅ Work Pack duplicated:', duplicatedWorkPack.id);
    
    // 4. Test Work Pack archive
    console.log('\n4. Testing Work Pack archive...\n');
    
    await WorkPackService.archive(testWorkPack.id!, orgId);
    
    console.log('✅ Work Pack archived');
    
    // 5. Test Template creation (if templates table exists)
    console.log('\n5. Testing Template creation...\n');
    
    try {
      const testTemplate = await TemplateService.create({
        organization_id: orgId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        name: 'Test Template - Activity Logging',
        category: 'testing',
        description: 'Testing activity logging for templates',
        is_custom: true,
        items: [
          {
            name: 'Test Item 1',
            description: 'First test item',
            quantity: 1,
            unit: 'unit',
            price_per_unit: 100
          }
        ]
      });
      
      console.log('✅ Template created:', testTemplate.id);
      
      // 6. Test Template update
      console.log('\n6. Testing Template update...\n');
      
      await TemplateService.update(testTemplate.id!, {
        name: 'Updated Test Template',
        items: [
          {
            name: 'Updated Test Item',
            description: 'Updated test item',
            quantity: 2,
            unit: 'units',
            price_per_unit: 150
          }
        ]
      });
      
      console.log('✅ Template updated');
      
      // Clean up template
      await TemplateService.delete(testTemplate.id!, orgId);
      console.log('✅ Template deleted');
      
    } catch (error) {
      console.log('⚠️  Templates table might not exist:', error);
    }
    
    // 7. Check recent activities
    console.log('\n7. Checking recent activities...\n');
    
    const { data: recentActivities } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .in('entity_type', ['work_pack', 'template'])
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (recentActivities && recentActivities.length > 0) {
      console.log('Recent work pack/template activities:');
      recentActivities.forEach((activity, i) => {
        console.log(`${i + 1}. [${activity.entity_type}] ${activity.action}: ${activity.entity_name || 'N/A'}`);
        console.log(`   Created: ${new Date(activity.created_at).toLocaleString()}`);
        if (activity.metadata) {
          console.log(`   Metadata:`, activity.metadata);
        }
        console.log('');
      });
    } else {
      console.log('❌ No recent work pack/template activities found!');
    }
    
    // Clean up
    console.log('\n8. Cleaning up test data...\n');
    await WorkPackService.delete(testWorkPack.id!, orgId);
    await WorkPackService.delete(duplicatedWorkPack.id!, orgId);
    console.log('✅ Test data cleaned up');
    
    console.log('\n=== TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testWorkPackAndTemplateLogging = testWorkPackAndTemplateLogging;
}
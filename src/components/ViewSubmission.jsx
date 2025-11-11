import React from 'react';
import { Box, Title, Text, SimpleGrid, Badge, Stack, Image, Group } from '@mantine/core';

// Helper component for displaying data
function DataPair({ label, value }) {
  if (!value) return null; // Don't render if no value

  return (
    <Box>
      <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text size="md">{value}</Text>
    </Box>
  );
}

function ViewSubmission({ submission }) {
  if (!submission) return null;

  const pathways = submission.clinical_pathways || [];

  return (
    <Stack gap="lg" p="md">
      <Title order={3}>Patient Information</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <DataPair label="Patient Name" value={submission.patient_name} />
        <DataPair label="Date of Birth" value={new Date(submission.dob).toLocaleDateString()} />
        <DataPair label="Age" value={submission.age} />
        <DataPair label="Sex" value={submission.sex} />
        <DataPair label="Attending Physician" value={submission.attending_physician} />
      </SimpleGrid>

      <Title order={3} mt="lg">Provider Notes</Title>
      <DataPair label="Subjective, Objective, Assessment and Plan of Care" value={submission.healthcare_notes} />
      <DataPair label="Expected Length of Stay" value={`${submission.length_of_stay || 'N/A'} days`} />
      <DataPair label="Review of Current Medication" value={submission.medication_review} />

      <Title order={3} mt="lg">Orders</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <DataPair label="Monitoring" value={`Every ${submission.monitoring_hours || 'N/A'} hours`} />
        <DataPair label="Patient's Diet" value={submission.patient_diet} />
      </SimpleGrid>

      <Box mt="md">
        <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
          Clinical Pathways
        </Text>
        {pathways.length > 0 ? (
          <Group gap="xs" mt="xs">
            {pathways.map((path) => (
              <Badge key={path} variant="light">{path}</Badge>
            ))}
          </Group>
        ) : (
          <Text size="md">No clinical pathways selected.</Text>
        )}
      </Box>

      <Title order={3} mt="lg">Prepared By</Title>
      {submission.prepared_by_signature ? (
        <Box>
          <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
            Signature
          </Text>
          <Box mt="xs" p="md" style={{ border: '1px solid #e0e0e0', borderRadius: '4px', background: '#f9f9f9' }}>
            <Image 
              src={submission.prepared_by_signature} 
              alt="Signature" 
              style={{ maxWidth: '300px', height: 'auto' }} 
            />
          </Box>
        </Box>
      ) : (
        <Text size="md">Not signed.</Text>
      )}
    </Stack>
  );
}

export default ViewSubmission;
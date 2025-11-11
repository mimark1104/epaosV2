import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Checkbox,
  Button,
  Container,
  Title,
  Stack,
  Group,
  Modal,
  Box,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import SignaturePad from 'react-signature-canvas';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

// Required CSS imports for components
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

// Checkbox items
const checkboxItems = [
  'Lorem ipsum dolor sit amet.',
  'Consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt.',
  'Ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam.',
  'Quis nostrud exercitation ullamco.',
  'Laboris nisi ut aliquip ex ea.',
  'Commodo consequat.',
  'Duis aute irure dolor in.',
  'Reprehenderit in voluptate velit.',
  'Esse cillum dolore eu fugiat.',
];

function AdmissionForm() {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const sigPadRef = useRef(null);

  // Manually register all fields that are not plain TextInputs
  useEffect(() => {
    register('dob', { required: 'Date of birth is required' });
    register('age', { required: 'Age is required', valueAsNumber: true });
    register('sex', { required: 'Sex is required' });
    register('length_of_stay', { valueAsNumber: true });
    register('monitoring_hours', { valueAsNumber: true });
    register('clinical_pathways');
  }, [register]);

  // This function will run when the form is submitted
  const onSubmit = async (data) => {
    setIsLoading(true);

    // Combine form data with the saved signature
    const finalData = {
      ...data,
      prepared_by_signature: signatureData,
    };

    try {
      // Send data to our serverless function
      const response = await axios.post('/api/submit-form', finalData);
      console.log('API Response:', response.data);

      // Show success notification
      notifications.show({
        title: 'Success!',
        message: 'Patient admission form has been submitted.',
        color: 'green',
      });

      // Reset the form fields
      reset();
      setSignatureData(null);
      if (sigPadRef.current) {
        sigPadRef.current.clear();
      }

    } catch (error)
{
      console.error('Submission Error:', error);
      
      // Show error notification
      notifications.show({
        title: 'Error',
        message: 'There was a problem submitting the form. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleSaveSignature = () => {
    if (sigPadRef.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataUrl = sigPadRef.current.toDataURL('image/png');
    setSignatureData(dataUrl);
    setIsModalOpen(false);
    console.log('Signature saved!');
  };

  const handleClearSignature = () => {
    sigPadRef.current.clear();
    setSignatureData(null);
  };

  return (
    <Container p="md" size="md">
      <Title order={2} ta="center" mb="xl">
        ePAOS Form - Patient Admission Order Sheet
      </Title>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          
          {/* Section 1: Patient Info */}
          <Title order={4}>Patient Information</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Patient Name"
              placeholder="Full name"
              withAsterisk
              {...register('patient_name', { required: 'Patient name is required' })}
              error={errors.patient_name?.message}
            />
            <DatePickerInput
              label="Date of Birth"
              placeholder="Select date"
              withAsterisk
              onChange={(date) => setValue('dob', date, { shouldValidate: true })}
              error={errors.dob?.message}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Age"
              placeholder="Patient's age"
              min={0}
              max={120}
              withAsterisk
              onChange={(value) => setValue('age', value, { shouldValidate: true })}
              error={errors.age?.message}
            />
            <Select
              label="Sex"
              placeholder="Select sex"
              data={['Male', 'Female', 'Other']}
              withAsterisk
              onChange={(value) => setValue('sex', value, { shouldValidate: true })}
              error={errors.sex?.message}
            />
          </SimpleGrid>
          <TextInput
            label="Attending Physician"
            placeholder="Dr. John Doe"
            withAsterisk
            {...register('attending_physician', { required: 'Physician is required' })}
            error={errors.attending_physician?.message}
          />

          {/* Section 2: Health Care Provider's Notes */}
          <Title order={4} mt="lg">Health Care Provider's Notes</Title>
          <Textarea
            label="Subjective, Objective, Assessment and Plan of Care"
            placeholder="Enter notes here..."
            minRows={5}
            {...register('healthcare_notes')}
          />
          <NumberInput
            label="Expected Length of Stay (days)"
            placeholder="e.g., 3"
            min={0}
            onChange={(value) => setValue('length_of_stay', value)}
          />
          <Textarea
            label="Review of Current Medication"
            placeholder="Enter medication review..."
            minRows={3}
            {...register('medication_review')}
          />
          
          {/* Section 3: Orders */}
          <Title order={4} mt="lg">Orders</Title>
          <NumberInput
            label="Monitoring (in every 'X' hours)"
            placeholder="e.g., 4"
            min={0}
            onChange={(value) => setValue('monitoring_hours', value)}
          />
          <TextInput
            label="Patient's Diet"
            placeholder="e.g., NPO, Low salt, etc."
            {...register('patient_diet')}
          />
          <Checkbox.Group
            label="Activate Clinical Pathway (Select multiple)"
            onChange={(value) => setValue('clinical_pathways', value)}
          >
            <Stack mt="xs">
              {checkboxItems.map((item) => (
                <Checkbox key={item} label={item} value={item} />
              ))}
            </Stack>
          </Checkbox.Group>
          
          {/* Section 4: Prepared by & Signature */}
          <Title order={4} mt="lg">Prepared By</Title>
          <Box
            p="md"
            style={{
              border: '1px dashed grey',
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setIsModalOpen(true)}
          >
            {signatureData ? (
              <img 
                src={signatureData} 
                alt="Patient Signature" 
                style={{ maxWidth: '100%', height: '100px', objectFit: 'contain' }} 
              />
            ) : (
              <Text c="dimmed">Click to Add Signature</Text>
            )}
          </Box>

          <Button type="submit" size="md" mt="xl" loading={isLoading}>
            Submit Admission Form
          </Button>
        </Stack>
      </form>

      {/* Signature Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Please Sign Below"
        size="md"
      >
        <Stack>
          <Box style={{ border: '1px solid black' }}>
            <SignaturePad
              ref={sigPadRef}
              canvasProps={{
                width: 450,
                height: 200,
                className: 'signature-canvas',
              }}
            />
          </Box>
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClearSignature}>
              Clear
            </Button>
            <Button onClick={handleSaveSignature}>
              Save Signature
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default AdmissionForm;
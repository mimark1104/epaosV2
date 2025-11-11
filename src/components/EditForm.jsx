import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Checkbox,
  Button,
  Stack,
  Group,
  Modal,
  Box,
  SimpleGrid,
  Text,
  Title, // <-- FIX 1: 'Title' has been added here
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import SignaturePad from 'react-signature-canvas';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

// --- Import CSS ---
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
  'Rephenderit in voluptate velit.',
  'Esse cillum dolore eu fugiat.',
];

/**
 * This is the form component used inside the Edit Modal.
 */
function EditForm({ submission, onSuccess, onClose }) {
  const { register, handleSubmit, setValue, trigger, reset, watch, formState: { errors } } = useForm({
    defaultValues: submission || {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(submission?.prepared_by_signature || null);
  const sigPadRef = useRef(null);

  // This useEffect populates the form when the 'submission' prop is ready.
  useEffect(() => {
    if (submission) {
      // Manually register fields
      register('dob', { required: 'Date of birth is required' });
      register('age', { required: 'Age is required' });
      register('sex', { required: 'Sex is required' });
      register('length_of_stay');
      register('monitoring_hours');
      register('clinical_pathways');
      
      // Reset the form with all submission data
      reset({
        ...submission,
        dob: submission.dob ? new Date(submission.dob) : null,
      });
      setSignatureData(submission.prepared_by_signature || null);
    }
  }, [submission, register, reset]);


  // This function runs when the Edit Form is submitted
  const onEditSubmit = async (data) => {
    setIsLoading(true);

    const finalData = {
      ...data,
      id: submission.id, // Make sure to include the ID
      prepared_by_signature: signatureData,
    };

    try {
      // --- FIX 2: Changed from .put to .post ---
      const response = await axios.post('/api/update-submission', finalData);

      notifications.show({
        title: 'Success!',
        message: 'Submission has been updated.',
        color: 'green',
      });
      
      onSuccess(response.data.data); 
      onClose(); // Close the modal

    } catch (error) {
      console.error('Update Error:', error);
      notifications.show({
        title: 'Error',
        message: 'There was a problem updating the form.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Signature Pad Logic ---
  const handleSaveSignature = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataUrl = sigPadRef.current.toDataURL('image/png');
    setSignatureData(dataUrl);
    setIsModalOpen(false);
  };

  const handleClearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    setSignatureData(null);
  };

  const handleDateChange = (date) => {
    setValue('dob', date);
    trigger('dob');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onEditSubmit)}>
        <Stack gap="lg">
          
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
              value={watch('dob')}
              onChange={handleDateChange}
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
              value={watch('age') || ''}
              onChange={(val) => setValue('age', val)}
              error={errors.age?.message}
            />
            <Select
              label="Sex"
              placeholder="Select sex"
              data={['Male', 'Female', 'Other']}
              withAsterisk
              value={watch('sex')}
              onChange={(val) => setValue('sex', val)}
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
            value={watch('length_of_stay') || ''}
            onChange={(val) => setValue('length_of_stay', val)}
          />
          <Textarea
            label="Review of Current Medication"
            placeholder="Enter medication review..."
            minRows={3}
            {...register('medication_review')}
          />
          
          <Title order={4} mt="lg">Orders</Title>
          <NumberInput
            label="Monitoring (in every 'X' hours)"
            placeholder="e.g., 4"
            min={0}
            value={watch('monitoring_hours') || ''}
            onChange={(val) => setValue('monitoring_hours', val)}
          />
          <TextInput
            label="Patient's Diet"
            placeholder="e.g., NPO, Low salt, etc."
            {...register('patient_diet')}
          />
          <Checkbox.Group
            label="Activate Clinical Pathway (Select multiple)"
            value={watch('clinical_pathways') || []}
            onChange={(val) => setValue('clinical_pathways', val)}
          >
            <Stack mt="xs">
              {checkboxItems.map((item) => (
                <Checkbox key={item} label={item} value={item} />
              ))}
            </Stack>
          </Checkbox.Group>
          
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

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Signature Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Please Sign Below"
        size="md"
        centered
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
    </>
  );
}

export default EditForm;
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Container,
  Title,
  Table,
  Button,
  Group,
  Loader,
  ScrollArea,
  Text,
  Badge,
  Modal,
  TextInput,
  SimpleGrid,
  Card,
  Stack,
  useMantineTheme,
  AppShell,
  Burger,
  NavLink,
  Image, // <-- Added Image component
} from '@mantine/core';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import EditForm from '../components/EditForm.jsx';
import ViewSubmission from '../components/ViewSubmission.jsx';
import Papa from 'papaparse';

function AdminDashboard() {
  // --- State for Sidebar ---
  const [opened, { toggle }] = useDisclosure();

  // --- All your existing state ---
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submissionToEdit, setSubmissionToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submissionToView, setSubmissionToView] = useState(null);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  
  // --- All your existing functions (useEffect, useMemo, handlers) ---
  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/get-submissions');
        setSubmissions(response.data.submissions);
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const [startDate, endDate] = dateRange;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((item) => new Date(item.created_at) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((item) => new Date(item.created_at) <= end);
    }
    return filtered;
  }, [submissions, searchQuery, dateRange]);

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      notifications.show({
        title: 'No Data',
        message: 'There is no data to export.',
        color: 'yellow',
      });
      return;
    }
    const dataForCSV = filteredSubmissions.map(item => ({
      PatientName: item.patient_name,
      DateOfBirth: item.dob,
      Age: item.age,
      Sex: item.sex,
      AttendingPhysician: item.attending_physician,
      SubmittedAt: new Date(item.created_at).toLocaleString(),
      LengthOfStay: item.length_of_stay,
      MonitoringHours: item.monitoring_hours,
      Diet: item.patient_diet,
      HealthcareNotes: item.healthcare_notes,
      MedicationReview: item.medication_review,
      ClinicalPathways: (item.clinical_pathways || []).join(', '),
      IsSigned: item.prepared_by_signature ? 'Yes' : 'No',
    }));
    const csv = Papa.unparse(dataForCSV);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'submissions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openViewModal = (submission) => {
    setSubmissionToView(submission);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  const openEditModal = (submission) => {
    setSubmissionToEdit(submission);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleEditSuccess = (updatedSubmission) => {
    setSubmissions(current => 
      current.map(s => (s.id === updatedSubmission.id ? updatedSubmission : s))
    );
    closeEditModal();
  };

  const openDeleteModal = (id) => {
    setSubmissionToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDelete = async () => {
    if (!submissionToDelete) return;
    try {
      await axios.post('/api/delete-submission', { id: submissionToDelete });
      setSubmissions(current => current.filter(s => s.id !== submissionToDelete));
      notifications.show({
        title: 'Deleted!',
        message: 'Submission has been deleted.',
        color: 'green',
      });
      closeDeleteModal();
    } catch (err) {
      console.error('Delete Error:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete submission.',
        color: 'red',
      });
    }
  };

  const rows = filteredSubmissions.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.patient_name}</Table.Td>
      <Table.Td>{new Date(item.dob).toLocaleDateString()}</Table.Td>
      <Table.Td>{item.age}</Table.Td>
      <Table.Td>{item.sex}</Table.Td>
      <Table.Td>{item.attending_physician}</Table.Td>
      <Table.Td>
        <Badge color={item.prepared_by_signature ? 'green' : 'gray'}>
          {item.prepared_by_signature ? 'Signed' : 'No'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button size="xs" variant="filled" onClick={() => openViewModal(item)}>
            View
          </Button>
          <Button size="xs" variant="outline" onClick={() => openEditModal(item)}>
            Edit
          </Button>
          <Button
            size="xs"
            color="red"
            variant="outline"
            onClick={() => openDeleteModal(item.id)}
          >
            Delete
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (isLoading) {
    return <Container p="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></Container>;
  }

  if (error) {
    return <Container p="md"><Text color="red" ta="center">{error}</Text></Container>;
  }


  return (
    // --- New AppShell Layout ---
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* --- Header Bar --- */}
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <Title order={3}>Admin Panel</Title> */} {/* <-- Replaced this text */}
          
          {/* --- Added your logo --- */}
          <Image
            src="/makati-life-logo.png" // This path works because the image is in the 'public' folder
            h={40} // You can adjust the height
            w="auto"
            alt="Makati Life Logo"
          />
        </Group>
      </AppShell.Header>

      {/* --- Side Navigation Panel --- */}
      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          component={Link}
          to="/admin/dashboard"
          active
        />
        {/* <NavLink
          label="Public Form"
          component={Link}
          to="/"
        /> */}
        <NavLink
          label="Logout"
          onClick={() => alert('Logout functionality not yet implemented.')}
        />
      </AppShell.Navbar>

      {/* --- Main Content Area --- */}
      <AppShell.Main>
        {/* All your existing content goes here */}
        <Container p="md" size="xl">
          {/* This is the change you requested */}
          <Title order={2} ta="left" mb="xl">
            Submissions
          </Title>
          
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="xl">
            <TextInput
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              clearable
            />
            <DatePickerInput
              type="range"
              placeholder="Filter by submission date"
              value={dateRange}
              onChange={setDateRange}
              clearable
            />
            <Button onClick={handleExportCSV} h="2.25rem" style={{ alignSelf: 'flex-end' }}>
              Export to CSV
            </Button>
          </SimpleGrid>

          {filteredSubmissions.length === 0 ? (
            <Text ta="center" c="dimmed" mt="xl">
              {submissions.length > 0 ? 'No submissions match your filters.' : 'No submissions found.'}
            </Text>
          ) : isMobile ? (
            <Stack gap="md" mt="md">
              {filteredSubmissions.map((item) => (
                <Card withBorder shadow="sm" radius="md" key={item.id}>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={700}>{item.patient_name}</Text>
                      <Badge color={item.prepared_by_signature ? 'green' : 'gray'}>
                        {item.prepared_by_signature ? 'Signed' : 'No'}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      DOB: {new Date(item.dob).toLocaleDateString()} | Age: {item.age} | Sex: {item.sex}
                    </Text>
                    <Text size="sm">
                      Physician: {item.attending_physician}
                    </Text>
                    <Group gap="xs" mt="md">
                      <Button size="xs" variant="filled" onClick={() => openViewModal(item)} fullWidth>
                        View
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => openEditModal(item)} fullWidth>
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        onClick={() => openDeleteModal(item.id)}
                        fullWidth
                      >
                        Delete
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Patient Name</Table.Th>
                    <Table.Th>DOB</Table.Th>
                    <Table.Th>Age</Table.Th>
                    <Table.Th>Sex</Table.Th>
                    <Table.Th>Attending Physician</Table.Th>
                    <Table.Th>Signed</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Container>
      </AppShell.Main>

      {/* --- Modals (must be outside AppShell.Main) --- */}
      <Modal
        opened={isViewModalOpen}
        onClose={closeViewModal}
        title="View Submission Details"
        size="xl"
        scrollable
      >
        <ViewSubmission submission={submissionToView} />
      </Modal>

      <Modal
        opened={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Submission"
        size="xl"
        scrollable
      >
        <EditForm
          submission={submissionToEdit}
          onSuccess={handleEditSuccess}
          onClose={closeEditModal}
        />
      </Modal>

      <Modal
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        centered
      >
        <Text>Are you sure you want to delete this submission? This action cannot be undone.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}

export default AdminDashboard;
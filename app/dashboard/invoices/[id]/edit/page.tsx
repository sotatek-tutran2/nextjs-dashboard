import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

// import fetchCustomers to fetch the customer names for the dropdown, import a new function called fetchInvoiceById and pass the id as an argument
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

// [id] => dynamic route segment

// In addition to searchParams, page components also accept a prop called params which you can use to access the id
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  // Promise.all to fetch both the invoice and customers in parallel:
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  // You can use a conditional to invoke notFound if the invoice doesn't exit
  if (!invoice) notFound();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* This form should pre-populated with a defaultValue for the customer's name, invoice amount, and status */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}

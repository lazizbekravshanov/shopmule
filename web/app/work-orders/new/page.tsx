import { redirect } from 'next/navigation';

// The New Work Order quick-action in the sidebar points here.
// The work orders list page already contains the NewWorkOrderModal,
// so we redirect there — the user clicks "+ New Work Order" to open it.
export default function NewWorkOrderPage() {
  redirect('/work-orders');
}

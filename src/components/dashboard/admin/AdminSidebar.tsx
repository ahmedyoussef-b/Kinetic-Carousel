// src/components/dashboard/admin/AdminSidebar.tsx
import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";

interface AdminSidebarProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Data fetching is now co-located with the component that uses it.
async function getSidebarData() {
    // PRISMA BYPASS: Return empty arrays to prevent crashes due to libssl error.
    console.warn("PRISMA BYPASS in AdminSidebar: Returning empty data for announcements and events.");
    const announcements: any[] = [];
    const events: any[] = [];
    
    // Data is serialized here before being passed to client components if necessary
    return {
        announcements: JSON.parse(JSON.stringify(announcements)),
        events: JSON.parse(JSON.stringify(events)),
    };
}


const AdminSidebar = async ({ searchParams }: AdminSidebarProps) => {
    const { announcements, events } = await getSidebarData();
    const eventDates = events.map((event: { startTime: Date }) => new Date(event.startTime).toISOString().split('T')[0]);
    const uniqueEventDates = [...new Set(eventDates)] as string[];
    
    return (
        <>
            <EventCalendarContainer 
                date={searchParams.date}
                events={events} // Pass events directly
                eventDates={uniqueEventDates} // Pass dates for highlighting
            />
            <div className="flex-1 min-h-0">
                <Announcements initialAnnouncements={announcements} />
            </div>
        </>
    );
};

export default AdminSidebar;

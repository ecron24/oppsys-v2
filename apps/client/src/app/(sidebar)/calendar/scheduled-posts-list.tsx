import type { CalendarEvent } from "@/components/schelude/schelude-types";
import { Calendar, Clock, Edit, Trash2, Send } from "lucide-react";
import moment from "moment";
// import "moment/locale/fr";

moment.locale("fr");

interface ScheduledPostsListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

const ScheduledPostsList = ({
  events,
  onSelectEvent,
}: ScheduledPostsListProps) => {
  // Trier les événements par date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Grouper les événements par date
  const groupedEvents = sortedEvents.reduce(
    (groups, event) => {
      const date = moment(event.start).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    },
    {} as Record<string, CalendarEvent[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dayEvents]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {moment(date).format("dddd D MMMM YYYY")}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onSelectEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <h4 className="font-medium">{event.title}</h4>
                      {/* Indicateur de statut */}
                      {event.resource.status === "scheduled" && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Planifié
                        </span>
                      )}
                      {event.resource.status === "running" && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Clock className="h-4 w-4" />
                      {moment(event.start).format("HH:mm")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-muted transition-colors">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun post planifié</h3>
          <p className="text-muted-foreground">
            Vous n'avez aucun post planifié pour cette période.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduledPostsList;

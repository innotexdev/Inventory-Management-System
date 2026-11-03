import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMyAssignments, getMyItems } from "@/lib/users";

export const instant = false;

export const metadata: Metadata = {
  title: "My inventory",
  description: "Equipment assigned to you",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const TABLE_CLASSNAME = "w-full min-w-[36rem] text-left text-sm";
const HEADER_CLASSNAME =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const CELL_CLASSNAME = "px-4 py-3 align-middle text-zinc-950 dark:text-zinc-50";

export default async function MyInventoryPage() {
  await requireUser("/my-inventory");

  const [items, assignments] = await Promise.all([getMyItems(), getMyAssignments()]);

  const activeAssignedAt = new Map<string, string>();
  for (const assignment of assignments) {
    if (assignment.returnedAt === null) {
      activeAssignedAt.set(assignment.item.id, assignment.assignedAt);
    }
  }

  const pastAssignments = assignments.filter((assignment) => assignment.returnedAt !== null);

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        My inventory
      </h1>

      <section
        aria-labelledby="current-equipment-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="current-equipment-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Assigned to you
        </h2>
        {items.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Nothing is assigned to you yet. When a manager or admin assigns equipment to you, it
            will appear here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table aria-label="Items currently assigned to you" className={TABLE_CLASSNAME}>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Asset tag
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Item
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Category
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Serial number
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Assigned
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                  >
                    <td className={CELL_CLASSNAME}>{item.assetTag}</td>
                    <td className={CELL_CLASSNAME}>{item.name}</td>
                    <td className={CELL_CLASSNAME}>{item.category.name}</td>
                    <td className={CELL_CLASSNAME}>{item.serialNumber ?? "—"}</td>
                    <td className={CELL_CLASSNAME}>
                      {activeAssignedAt.has(item.id)
                        ? dateFormatter.format(new Date(activeAssignedAt.get(item.id) as string))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        aria-labelledby="history-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="history-heading" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Assignment history
        </h2>
        {pastAssignments.length === 0 ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No past assignments yet. Equipment you return in the future will be listed here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table aria-label="Your past assignments" className={TABLE_CLASSNAME}>
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Item
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Asset tag
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Assigned
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Returned
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Assigned by
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Returned by
                  </th>
                  <th scope="col" className={HEADER_CLASSNAME}>
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {pastAssignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                  >
                    <td className={CELL_CLASSNAME}>{assignment.item.name}</td>
                    <td className={CELL_CLASSNAME}>{assignment.item.assetTag}</td>
                    <td className={CELL_CLASSNAME}>
                      {dateFormatter.format(new Date(assignment.assignedAt))}
                    </td>
                    <td className={CELL_CLASSNAME}>
                      {assignment.returnedAt === null
                        ? "—"
                        : dateFormatter.format(new Date(assignment.returnedAt))}
                    </td>
                    <td className={CELL_CLASSNAME}>
                      {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                    </td>
                    <td className={CELL_CLASSNAME}>
                      {assignment.returnedBy === null
                        ? "—"
                        : `${assignment.returnedBy.firstName} ${assignment.returnedBy.lastName}`}
                    </td>
                    <td className={CELL_CLASSNAME}>{assignment.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

import { Button, IconButton } from "@/components/base/button";
import { Input } from "@/components/base/input";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectOption,
  SelectTrigger,
} from "@/components/base/select";
import { PencilSimple, Power } from "@phosphor-icons/react";

export function AdminIndexPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800">Administrators</h1>
      <form className="mt-5">
        <div className="flex items-center gap-x-3">
          <Input
            type="search"
            placeholder="Search by full name or email"
            className="flex-1"
          />
          <Select defaultValue={{ label: "All role", value: "all" }}>
            {({ selectedOption }) => (
              <>
                <SelectLabel className="sr-only">Role</SelectLabel>
                <SelectTrigger className="w-48">
                  {selectedOption?.label ?? "Select role"}
                </SelectTrigger>
                <SelectContent className="w-48">
                  <SelectOption value="all" label="All role" />
                  <SelectOption value="super_user" label="Super User" />
                  <SelectOption value="operator" label="Operator" />
                </SelectContent>
              </>
            )}
          </Select>
          <Button variant="transparent" type="reset" className="text-red-500">
            Reset
          </Button>
        </div>
      </form>
      <div className="mt-5">
        <table className="w-full text-sm rounded-md shadow-haptic-gray-300">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-300">
              <th className="px-3 py-2.5 font-medium text-left">Full Name</th>
              <th className="px-3 py-2.5 font-medium text-left">Email</th>
              <th className="px-3 py-2.5 font-medium text-left">Role</th>
              <th className="px-3 py-2.5 font-medium text-left">
                Date created
              </th>
              <th>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr>
              <td className="px-3 py-2.5">Faqih Muntashir</td>
              <td className="px-3 py-2.5">itsfaqih@gmail.com</td>
              <td className="px-3 py-2.5">Super User</td>
              <td className="px-3 py-2.5">2023-07-11 18:00</td>
              <td className="px-3 py-2.5 flex items-center justify-end gap-x-1">
                <IconButton icon={PencilSimple} label="Edit" />
                <IconButton
                  icon={Power}
                  label="Deactivate"
                  className="text-red-500"
                />
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2.5">Bambang Suparman</td>
              <td className="px-3 py-2.5">bambang@gmail.com</td>
              <td className="px-3 py-2.5">Operator</td>
              <td className="px-3 py-2.5">2023-07-12 21:00</td>
              <td className="px-3 py-2.5 flex items-center justify-end gap-x-1">
                <IconButton icon={PencilSimple} label="Edit" />
                <IconButton
                  icon={Power}
                  label="Deactivate"
                  className="text-red-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

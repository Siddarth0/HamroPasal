'use client';

import { useState } from 'react';
import { Users as UsersIcon, Search, Loader2 } from 'lucide-react';
import type { Role } from 'shared-types';
import { PageHeader } from '@/components/shared/page-header';
import { LoadingBlock, ErrorBlock, EmptyState } from '@/components/shared/states';
import { Pagination } from '@/components/shared/pagination';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUsers, useUpdateUser } from '@/features/users/hooks';
import type { AdminUser } from '@/features/users/api';
import { formatDate } from '@/lib/utils';

const ROLES: Role[] = ['CUSTOMER', 'SELLER', 'ADMIN'];

function UserRow({ user }: { user: AdminUser }) {
  const update = useUpdateUser();

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
        {user.store && (
          <p className="text-xs text-muted-foreground">Store: {user.store.name}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Select
          value={user.role}
          disabled={update.isPending}
          onChange={(e) => update.mutate({ id: user.id, input: { role: e.target.value as Role } })}
          className="h-9 w-32"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-3">
        {user.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Suspended</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        {user.isEmailVerified ? (
          <Badge variant="muted">Verified</Badge>
        ) : (
          <Badge variant="warning">Unverified</Badge>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-right">
        <Button
          variant={user.isActive ? 'outline' : 'brand'}
          size="sm"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: user.id, input: { isActive: !user.isActive } })}
        >
          {update.isPending && update.variables?.id === user.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user.isActive ? (
            'Suspend'
          ) : (
            'Activate'
          )}
        </Button>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | ''>('');
  const [active, setActive] = useState<'' | 'true' | 'false'>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useUsers({
    page,
    role: role || undefined,
    isActive: active === '' ? undefined : active === 'true',
    search: search || undefined,
  });

  const users = data?.items ?? [];
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <>
      <PageHeader title="Users" description="Manage accounts, roles and access" />

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as Role | '');
          }}
          className="w-40"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select
          value={active}
          onChange={(e) => {
            setPage(1);
            setActive(e.target.value as '' | 'true' | 'false');
          }}
          className="w-40"
        >
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
        </Select>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && <LoadingBlock />}
      {isError && <ErrorBlock message="Could not load users." />}

      {data && users.length === 0 && (
        <EmptyState icon={<UsersIcon className="h-10 w-10" />} title="No users match your filters" />
      )}

      {users.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <UserRow key={u.id} user={u} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Pagination meta={data?.meta} page={page} onPageChange={setPage} />
    </>
  );
}

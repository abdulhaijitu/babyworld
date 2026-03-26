

## Plan: পেজ হেডার ডাইনামিক করা

### পরিবর্তন

**`src/pages/admin/AdminTicketing.tsx`** (line 389-393):

হেডার টেক্সট `activeView` অনুযায়ী পরিবর্তন হবে:

- `tab=create` → **Create Ticket** (আইকন + টেক্সট), subtitle: "Create a new ticket"
- `tab=list` বা default → **Ticket List** (আইকন + টেক্সট), subtitle: "Manage tickets"

```tsx
<h1 className="text-2xl font-bold flex items-center gap-2">
  <Ticket className="w-6 h-6" />
  {activeView === 'create' ? 'Create Ticket' : 'Ticket List'}
</h1>
<p className="text-muted-foreground">
  {activeView === 'create' ? 'Create a new ticket' : 'Manage tickets'}
</p>
```

| ফাইল | পরিবর্তন |
|---|---|
| `src/pages/admin/AdminTicketing.tsx` | হেডার টেক্সট conditional |


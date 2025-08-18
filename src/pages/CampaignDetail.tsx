import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Campaign = {
  id: string
  user_id: string
  name: string
  product_service: string
  target_industry: string
  ideal_job_roles: string[]
  company_size: string
  region: string
  outreach_goal: string
  brand_voice: string
}

type Prospect = {
  id: string
  campaign_id: string
  name: string
  job_title: string
  company: string
  linkedin_url: string
  status: string
}

export default function CampaignDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    job_title: '',
    company: '',
    linkedin_url: '',
  })

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const [{ data: camp }, { data: pros }] = await Promise.all([
          supabase.from('campaigns').select('*').eq('id', id).single<Campaign>(),
          supabase.from('prospects').select('*').eq('campaign_id', id).order('created_at', { ascending: false }),
        ])
        setCampaign(camp as unknown as Campaign)
        setProspects((pros as unknown as Prospect[]) || [])
      } catch (error) {
        console.error(error)
        toast({ title: 'Error', description: 'Failed to load campaign', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, toast])

  const addProspect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase.from('prospects').insert({
        campaign_id: id,
        name: form.name,
        job_title: form.job_title,
        company: form.company,
        linkedin_url: form.linkedin_url,
        status: 'pending',
      }).select('*').single<Prospect>()
      if (error) throw error
      setProspects([data as unknown as Prospect, ...prospects])
      setForm({ name: '', job_title: '', company: '', linkedin_url: '' })
      toast({ title: 'Prospect added' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Error', description: 'Failed to add prospect', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const generateAndSaveMessage = async (
    p: Prospect,
    type: 'connection' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3',
    options?: { schedule?: boolean }
  ) => {
    if (!campaign) return
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: { prospect: p, campaign, messageType: type }
      })
      if (error) throw error
      const message = (data as { message?: string })?.message || ''
      const { error: iErr } = await supabase.from('messages').insert({
        prospect_id: p.id,
        campaign_id: campaign.id,
        type,
        content: message,
      })
      if (iErr) throw iErr

      if (options?.schedule) {
        const { error: qErr } = await supabase.from('messages_queue').insert({
          user_id: campaign.user_id,
          campaign_id: campaign.id,
          prospect_id: p.id,
          linkedin_url: p.linkedin_url,
          message,
          status: 'queued',
        })
        if (qErr) throw qErr
        toast({ title: 'Queued for sending', description: 'Message added to queue.' })
      } else {
        toast({ title: 'Message generated', description: 'Saved to messages table. Copied to clipboard.' })
        await navigator.clipboard.writeText(message)
        window.open(p.linkedin_url, '_blank')
      }
    } catch (err) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as any).message) : String(err)
      console.error('Generate message error:', err)
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const processQueueNow = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-queue', { body: { batchSize: 5 } })
      if (error) throw error
      toast({ title: 'Queue processed', description: `Processed ${data?.processed ?? 0} items.` })
    } catch (err) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as any).message) : String(err)
      console.error('Process queue error:', err)
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Link to="/" className="text-primary underline">Back</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={processQueueNow}>Process Queue</Button>
          <Link to="/" className="text-primary underline">Back</Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Prospect</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addProspect} className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="pname">Name</Label>
              <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pjob">Job Title</Label>
              <Input id="pjob" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="pcompany">Company</Label>
              <Input id="pcompany" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="plink">LinkedIn URL</Label>
              <Input id="plink" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} required />
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={submitting}>Add Prospect</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prospects</CardTitle>
        </CardHeader>
        <CardContent>
          {prospects.length === 0 ? (
            <p className="text-muted-foreground">No prospects yet.</p>
          ) : (
            <div className="space-y-4">
              {prospects.map((p) => (
                <div key={p.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.job_title} at {p.company}</div>
                    <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-primary text-sm">Open profile</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => generateAndSaveMessage(p, 'connection')}>Connection</Button>
                    <Button variant="outline" onClick={() => generateAndSaveMessage(p, 'follow_up_1')}>Follow-up 1</Button>
                    <Button variant="outline" onClick={() => generateAndSaveMessage(p, 'follow_up_2')}>Follow-up 2</Button>
                    <Button variant="outline" onClick={() => generateAndSaveMessage(p, 'follow_up_3')}>Follow-up 3</Button>
                    <Button onClick={() => generateAndSaveMessage(p, 'connection', { schedule: true })}>Schedule Connection</Button>
                    <Button onClick={() => generateAndSaveMessage(p, 'follow_up_1', { schedule: true })}>Schedule FU1</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



import { useEffect, useState } from "react";
import { Button, Card, Field, NumberInput, Select, TextInput } from "../components/ui";
import { bikeStore, driverStore, newId, suspensionStore, tireSetStore } from "../lib/storage";
import type { Bike, BikeCategory, Driver, ExperienceLevel, SuspensionSetup, TireCompound, TireSet } from "../types";

export function useForceUpdate() {
  const [, setTick] = useState(0);
  return () => setTick((t) => t + 1);
}

function DriverForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(180);
  const [experience, setExperience] = useState<ExperienceLevel>("amatør");

  function submit() {
    if (!name.trim()) return;
    const driver: Driver = { id: newId(), name: name.trim(), weightKg, heightCm, experience };
    driverStore.upsert(driver);
    setName("");
    onSaved();
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Field label="Navn">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ola Nordmann" />
      </Field>
      <Field label="Vekt (kg)">
        <NumberInput value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
      </Field>
      <Field label="Høyde (cm)">
        <NumberInput value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
      </Field>
      <Field label="Erfaring">
        <Select value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)}>
          <option value="nybegynner">Nybegynner</option>
          <option value="amatør">Amatør</option>
          <option value="viderekommen">Viderekommen</option>
          <option value="ekspert">Ekspert</option>
        </Select>
      </Field>
      <div className="col-span-2 sm:col-span-4">
        <Button onClick={submit}>Legg til sjåfør</Button>
      </div>
    </div>
  );
}

function BikeForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BikeCategory>("supersport");
  const [weightKg, setWeightKg] = useState<number | "">("");

  function submit() {
    if (!name.trim()) return;
    const bike: Bike = { id: newId(), name: name.trim(), category, weightKg: weightKg === "" ? undefined : weightKg };
    bikeStore.upsert(bike);
    setName("");
    onSaved();
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Field label="Modell">
        <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Yamaha YZF-R6" />
      </Field>
      <Field label="Kategori">
        <Select value={category} onChange={(e) => setCategory(e.target.value as BikeCategory)}>
          <option value="supersport">Supersport</option>
          <option value="superbike">Superbike</option>
          <option value="naken">Naken</option>
          <option value="annet">Annet</option>
        </Select>
      </Field>
      <Field label="Vekt (kg, valgfritt)">
        <NumberInput value={weightKg} onChange={(e) => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))} />
      </Field>
      <div className="col-span-2 flex items-end sm:col-span-1">
        <Button onClick={submit}>Legg til MC</Button>
      </div>
    </div>
  );
}

function SuspensionForm({ bikes, onSaved }: { bikes: Bike[]; onSaved: () => void }) {
  const [bikeId, setBikeId] = useState(bikes[0]?.id ?? "");
  const [frontBrand, setFrontBrand] = useState("");
  const [frontModel, setFrontModel] = useState("");
  const [rearBrand, setRearBrand] = useState("");
  const [rearModel, setRearModel] = useState("");
  const [adjustablePreload, setAdjustablePreload] = useState(true);
  const [adjustableCompression, setAdjustableCompression] = useState(true);
  const [adjustableRebound, setAdjustableRebound] = useState(true);

  useEffect(() => {
    if (!bikes.some((b) => b.id === bikeId)) {
      setBikeId(bikes[0]?.id ?? "");
    }
  }, [bikes, bikeId]);

  function submit() {
    if (!bikeId || !frontBrand.trim() || !rearBrand.trim()) return;
    const setup: SuspensionSetup = {
      id: newId(),
      bikeId,
      frontBrand: frontBrand.trim(),
      frontModel: frontModel.trim(),
      rearBrand: rearBrand.trim(),
      rearModel: rearModel.trim(),
      adjustablePreload,
      adjustableCompression,
      adjustableRebound,
    };
    suspensionStore.upsert(setup);
    setFrontBrand("");
    setFrontModel("");
    setRearBrand("");
    setRearModel("");
    onSaved();
  }

  if (bikes.length === 0) return <p className="text-sm text-neutral-500">Legg til en MC først.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Field label="MC">
        <Select value={bikeId} onChange={(e) => setBikeId(e.target.value)}>
          {bikes.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Frontdemper merke">
        <TextInput value={frontBrand} onChange={(e) => setFrontBrand(e.target.value)} placeholder="Öhlins" />
      </Field>
      <Field label="Frontdemper modell">
        <TextInput value={frontModel} onChange={(e) => setFrontModel(e.target.value)} placeholder="FGRT200" />
      </Field>
      <Field label="Bakdemper merke">
        <TextInput value={rearBrand} onChange={(e) => setRearBrand(e.target.value)} placeholder="Öhlins" />
      </Field>
      <Field label="Bakdemper modell">
        <TextInput value={rearModel} onChange={(e) => setRearModel(e.target.value)} placeholder="TTX36" />
      </Field>
      <div className="col-span-2 flex flex-wrap items-end gap-3 sm:col-span-3">
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={adjustablePreload} onChange={(e) => setAdjustablePreload(e.target.checked)} />
          Forspenning
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={adjustableCompression} onChange={(e) => setAdjustableCompression(e.target.checked)} />
          Kompresjon
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={adjustableRebound} onChange={(e) => setAdjustableRebound(e.target.checked)} />
          Retur
        </label>
      </div>
      <div className="col-span-2 flex items-end sm:col-span-4">
        <Button onClick={submit}>Legg til demperoppsett</Button>
      </div>
    </div>
  );
}

function TireForm({ onSaved }: { onSaved: () => void }) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [compound, setCompound] = useState<TireCompound>("dot");
  const [frontWearPercent, setFrontWearPercent] = useState(10);
  const [rearWearPercent, setRearWearPercent] = useState(10);

  function submit() {
    if (!brand.trim() || !model.trim()) return;
    const tireSet: TireSet = {
      id: newId(),
      brand: brand.trim(),
      model: model.trim(),
      compound,
      frontWearPercent,
      rearWearPercent,
    };
    tireSetStore.upsert(tireSet);
    setBrand("");
    setModel("");
    onSaved();
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Field label="Merke">
        <TextInput value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Pirelli" />
      </Field>
      <Field label="Modell">
        <TextInput value={model} onChange={(e) => setModel(e.target.value)} placeholder="SC1" />
      </Field>
      <Field label="Type">
        <Select value={compound} onChange={(e) => setCompound(e.target.value as TireCompound)}>
          <option value="slick">Slick</option>
          <option value="dot">DOT / trackday</option>
          <option value="veidekk">Veidekk (sport)</option>
          <option value="gate">Regndekk</option>
        </Select>
      </Field>
      <Field label="Slitasje fram (%)">
        <NumberInput min={0} max={100} value={frontWearPercent} onChange={(e) => setFrontWearPercent(Number(e.target.value))} />
      </Field>
      <Field label="Slitasje bak (%)">
        <NumberInput min={0} max={100} value={rearWearPercent} onChange={(e) => setRearWearPercent(Number(e.target.value))} />
      </Field>
      <div className="col-span-2 sm:col-span-5">
        <Button onClick={submit}>Legg til dekksett</Button>
      </div>
    </div>
  );
}

function ListRow({ primary, secondary, onDelete }: { primary: string; secondary?: string; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10">
      <div>
        <div className="font-medium text-neutral-900 dark:text-neutral-100">{primary}</div>
        {secondary && <div className="text-neutral-500">{secondary}</div>}
      </div>
      <Button variant="danger" onClick={onDelete} className="!px-2 !py-1 text-xs">
        Slett
      </Button>
    </div>
  );
}

export function ProfilesPage() {
  const refresh = useForceUpdate();
  const drivers = driverStore.all();
  const bikes = bikeStore.all();
  const suspensions = suspensionStore.all();
  const tireSets = tireSetStore.all();

  return (
    <div className="flex flex-col gap-6">
      <Card title="Sjåfører">
        <div className="mb-3 flex flex-col gap-2">
          {drivers.map((d) => (
            <ListRow
              key={d.id}
              primary={d.name}
              secondary={`${d.weightKg} kg · ${d.heightCm} cm · ${d.experience}`}
              onDelete={() => {
                driverStore.remove(d.id);
                refresh();
              }}
            />
          ))}
          {drivers.length === 0 && <p className="text-sm text-neutral-500">Ingen sjåfører lagt til ennå.</p>}
        </div>
        <DriverForm onSaved={refresh} />
      </Card>

      <Card title="Motorsykler">
        <div className="mb-3 flex flex-col gap-2">
          {bikes.map((b) => (
            <ListRow
              key={b.id}
              primary={b.name}
              secondary={`${b.category}${b.weightKg ? ` · ${b.weightKg} kg` : ""}`}
              onDelete={() => {
                bikeStore.remove(b.id);
                refresh();
              }}
            />
          ))}
          {bikes.length === 0 && <p className="text-sm text-neutral-500">Ingen motorsykler lagt til ennå.</p>}
        </div>
        <BikeForm onSaved={refresh} />
      </Card>

      <Card title="Demperoppsett">
        <div className="mb-3 flex flex-col gap-2">
          {suspensions.map((s) => {
            const bike = bikes.find((b) => b.id === s.bikeId);
            return (
              <ListRow
                key={s.id}
                primary={`${bike?.name ?? "Ukjent MC"}: ${s.frontBrand} / ${s.rearBrand}`}
                secondary={`Front: ${s.frontBrand} ${s.frontModel} · Bak: ${s.rearBrand} ${s.rearModel}`}
                onDelete={() => {
                  suspensionStore.remove(s.id);
                  refresh();
                }}
              />
            );
          })}
          {suspensions.length === 0 && <p className="text-sm text-neutral-500">Ingen demperoppsett lagt til ennå.</p>}
        </div>
        <SuspensionForm bikes={bikes} onSaved={refresh} />
      </Card>

      <Card title="Dekksett">
        <div className="mb-3 flex flex-col gap-2">
          {tireSets.map((t) => (
            <ListRow
              key={t.id}
              primary={`${t.brand} ${t.model} (${t.compound})`}
              secondary={`Slitasje fram ${t.frontWearPercent}% · bak ${t.rearWearPercent}%`}
              onDelete={() => {
                tireSetStore.remove(t.id);
                refresh();
              }}
            />
          ))}
          {tireSets.length === 0 && <p className="text-sm text-neutral-500">Ingen dekksett lagt til ennå.</p>}
        </div>
        <TireForm onSaved={refresh} />
      </Card>
    </div>
  );
}

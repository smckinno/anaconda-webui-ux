import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { Checkbox } from "@patternfly/react-core/dist/esm/components/Checkbox/index.js";
import { SearchInput } from "@patternfly/react-core/dist/esm/components/SearchInput/index.js";
import { Tabs, Tab, TabTitleText } from "@patternfly/react-core/dist/esm/components/Tabs/index.js";
import { Title } from "@patternfly/react-core/dist/esm/components/Title/index.js";
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core/dist/esm/components/ToggleGroup/index.js";
import { Switch } from "@patternfly/react-core/dist/esm/components/Switch/index.js";
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";
import { CardHeader } from "@patternfly/react-core/dist/esm/components/Card/CardHeader.js";
import { Form, FormGroup } from "@patternfly/react-core/dist/esm/components/Form/index.js";
import { Select, SelectGroup, SelectOption } from "@patternfly/react-core/dist/esm/components/Select/index.js";
import { TextInput } from "@patternfly/react-core/dist/esm/components/TextInput/index.js";
import { FileUpload } from "@patternfly/react-core/dist/esm/components/FileUpload/index.js";
import { AngleDownIcon, ArrowRightIcon, MinusCircleIcon, PlusCircleIcon, SearchIcon, TimesIcon } from "@patternfly/react-icons";
import RhUiCheckClipboardIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-check-clipboard-icon.js";
import RhUiCubesIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-cubes-icon.js";
import RhUiTemplateIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-template-icon.js";
import RhUiRegistryIcon from "@patternfly/react-icons/dist/esm/icons/rh-ui-registry-icon.js";
import SunIcon from "@patternfly/react-icons/dist/esm/icons/sun-icon.js";
import OutlinedMoonIcon from "@patternfly/react-icons/dist/esm/icons/outlined-moon-icon.js";
import { Wizard, WizardStep } from "@patternfly/react-core/dist/esm/components/Wizard/index.js";
import { Table, Thead, Tbody, Tr, Th, Td, TreeRowWrapper } from "@patternfly/react-table/dist/esm/components/Table/index.js";
import { RedhatIcon } from "@patternfly/react-icons/dist/esm/icons/redhat-icon.js";
import "@patternfly/patternfly/patternfly.css";
import "./preview.scss";

const stepContent = [
    { name: "Welcome", description: "Review the setup process and prepare to configure your system." },
    { name: "Network", description: "Configure the network connection this system will use." },
    { name: "Date and Time", description: "Set the time zone, date, and time for this system." },
    { name: "Create User Account", description: "Create the account you will use to sign in and administer the system." },
    { name: "Installation", description: "Choose the installation settings for Red Hat Enterprise Linux." },
    { name: "Software Content", description: "Select the software sources and content available to this system." },
    { name: "Storage", description: "Choose the disks and storage configuration for the installation." },
    { name: "Review", description: "Review your choices before beginning the installation." },
];

const ThemeToggle = ({ theme, setTheme, isCompact = false }) => <ToggleGroup
    aria-label="Choose appearance"
    isCompact={isCompact}
>
    <ToggleGroupItem
        buttonId={isCompact ? "wizard-theme-light" : "opening-theme-light"}
        text="Light"
        isSelected={theme === "light"}
        onChange={() => setTheme("light")}
    />
    <ToggleGroupItem
        buttonId={isCompact ? "wizard-theme-dark" : "opening-theme-dark"}
        text="Dark"
        isSelected={theme === "dark"}
        onChange={() => setTheme("dark")}
    />
</ToggleGroup>;

const AppearanceSwitch = ({ theme, setTheme }) => <div className="appearance-switch">
    <SunIcon aria-hidden="true" />
    <Switch
        id="opening-appearance-switch"
        aria-label="Use dark appearance"
        isChecked={theme === "dark"}
        onChange={(_, isDark) => setTheme(isDark ? "dark" : "light")}
    />
    <OutlinedMoonIcon aria-hidden="true" />
</div>;

const ModeCard = ({ mode, selected, title, description, icon, onSelect }) => <Card
    isClickable
    isCompact
    className={`mode-card${selected ? " is-selected" : ""}`}
    role="button"
    tabIndex={0}
    aria-pressed={selected}
    onClick={() => onSelect(mode)}
    onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(mode);
        }
    }}
>
    <CardHeader>
        <CardTitle>
            <span className="mode-icon" aria-hidden="true">{icon}</span>
            {title}
        </CardTitle>
    </CardHeader>
    <CardBody>{description}</CardBody>
</Card>;

const SourceTypeSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return <Select
        isOpen={isOpen}
        selected={value}
        onOpenChange={setIsOpen}
        onSelect={(event, nextValue) => { onChange(nextValue); setIsOpen(false); }}
        toggle={toggleRef => <button ref={toggleRef} type="button" className="source-type-toggle">{value}<span aria-hidden="true">▾</span></button>}
    >
        <SelectOption value="Repository URL" />
        <SelectOption value="Base OS repository" />
        <SelectOption value="Local mirror" />
    </Select>;
};

const SourceRows = ({ rows, setRows, label, placeholder, allowAdd }) => <div className="source-editor">
    <div className="source-column-labels"><span>Source type</span><span>{label}</span><span aria-hidden="true" /></div>
    {rows.map((row, index) => <div className="source-row" key={row.id}>
        <SourceTypeSelect value={row.type} onChange={type => setRows(rows.map(item => item.id === row.id ? { ...item, type } : item))} />
        <TextInput aria-label={`${label} ${index + 1}`} value={row.value} placeholder={placeholder} onChange={(_, value) => setRows(rows.map(item => item.id === row.id ? { ...item, value } : item))} />
        <Button variant="plain" aria-label={`Remove ${label.toLowerCase()} ${index + 1}`} isDisabled={rows.length === 1 && !allowAdd} onClick={() => setRows(rows.filter(item => item.id !== row.id))}><MinusCircleIcon /></Button>
    </div>)}
    {allowAdd && <Button variant="link" icon={<PlusCircleIcon />} onClick={() => setRows([...rows, { id: Date.now(), type: "Repository URL", value: "" }])}>Add source</Button>}
</div>;

const InstallationContent = ({ mode, setMode }) => {
    const [packageSources, setPackageSources] = useState([{ id: 1, type: "Repository URL", value: "" }]);
    const [registry, setRegistry] = useState([{ id: 1, type: "Container registry", value: "" }]);
    const [authentication, setAuthentication] = useState("public");
    return <section className="installation-content" aria-labelledby="installation-config-title">
        <Title headingLevel="h1" size="xl" id="installation-config-title">Installation</Title>
        <p className="installation-description">Choose how software will be installed on this system.</p>
        <div className="mode-cards" role="group" aria-label="Installation mode">
            <ModeCard mode="package" selected={mode === "package"} icon={<RhUiTemplateIcon />} title="Package mode" description="Install a traditional Red Hat Enterprise Linux system from package repositories. You can add one or more software sources." onSelect={setMode} />
            <ModeCard mode="image" selected={mode === "image"} icon={<RhUiRegistryIcon />} title="Image mode" description="Deploy a bootable image from a container registry for an image-based, managed system." onSelect={setMode} />
        </div>
        {mode === "package" ? <Form className="source-form"><FormGroup label="Package sources" fieldId="package-sources">{<SourceRows rows={packageSources} setRows={setPackageSources} label="URL" placeholder="www.website.com" allowAdd />}</FormGroup></Form> : <Form className="source-form image-form">
            <FormGroup label="Registry image path" fieldId="registry-image-path"><TextInput id="registry-image-path" placeholder="registry.example.com/organization/image:tag" /></FormGroup>
            <FormGroup label="Authentication type" fieldId="authentication-type"><ToggleGroup aria-label="Authentication type"><ToggleGroupItem buttonId="auth-public" text="Public / No authentication" isSelected={authentication === "public"} onChange={() => setAuthentication("public")} /><ToggleGroupItem buttonId="auth-private" text="Private / Authentication required" isSelected={authentication === "private"} onChange={() => setAuthentication("private")} /></ToggleGroup></FormGroup>
            <div className="image-credentials">
                <FormGroup label="Username" fieldId="registry-username"><TextInput id="registry-username" isDisabled={authentication !== "private"} /></FormGroup>
                <FormGroup label="Password or personal access token (PAT)" fieldId="registry-password"><TextInput id="registry-password" type="password" isDisabled={authentication !== "private"} /></FormGroup>
            </div>
            <FormGroup label="Custom CA certificate (optional)" fieldId="custom-ca"><FileUpload id="custom-ca" type="text" filenamePlaceholder="Choose a .crt file" browseButtonText="Upload certificate" /></FormGroup>
        </Form>}
    </section>;
};

const environments = [
    { id: "fedora-cloud", name: "Fedora Cloud Server", description: "A server install with components needed to run in a cloud environment." },
    { id: "fedora-custom", name: "Fedora Custom Operating System", description: "Basic building block for a custom Fedora system." },
    { id: "fedora-server", name: "Fedora Server Edition", description: "An integrated, easier to manage server." },
    { id: "fedora-workstation", name: "Fedora Workstation", description: "A user-friendly desktop system for laptops and PCs." },
    { id: "kde-mobile", name: "KDE Plasma Mobile", description: "The KDE Plasma Mobile environment includes KDE Plasma Mobile and many Plasma Mobile applications." },
    { id: "kde-workspaces", name: "KDE Plasma Workspaces", description: "A highly configurable graphical interface with a panel, desktop, system icons, widgets, and KDE applications." },
    { id: "none", name: "None", description: "Continue without selecting a base environment." },
    { id: "xfce-desktop", name: "Xfce Desktop", description: "A lightweight desktop environment that works well on low-end machines." },
];

const getEnvironmentName = environment => environment && environment !== "none" ? environments.find(item => item.id === environment)?.name : undefined;
const getEnvironmentAddOns = environment => environment && environment !== "none" ? environmentAddOns[environment] || [] : [];

const environmentAddOns = {
    "fedora-custom": [
        { id: "guest-agents", name: "Guest Agents", description: "Agents used when running under a hypervisor." },
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "standard", name: "Standard", description: "Common set of utilities that extend the minimal installation." },
    ],
    "fedora-server": [
        { id: "guest-agents", name: "Guest Agents", description: "Agents used when running under a hypervisor." },
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "server-tools", name: "Server Tools", description: "Utilities for managing services, storage, and system administration." },
        { id: "web-server", name: "Web Server", description: "A ready to configure web server and related tools." },
    ],
    "fedora-workstation": [
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "development-tools", name: "Development Tools", description: "Compilers, debuggers, and build utilities for software development." },
        { id: "container-management", name: "Container Management", description: "Tools for building, running, and managing containers." },
        { id: "office-suite", name: "Office Suite and Productivity", description: "Applications for documents, spreadsheets, and presentations." },
    ],
    "fedora-cloud": [
        { id: "guest-agents", name: "Guest Agents", description: "Agents used when running under a hypervisor." },
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "virtualization-tools", name: "Virtualization Tools", description: "Tools to create, run, and administer virtual machines." },
        { id: "virtualization-platform", name: "Virtualization Platform", description: "Services for hosting virtual machines on this system." },
    ],
    "kde-mobile": [
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "mobile-applications", name: "Plasma Mobile Applications", description: "Applications and utilities designed for the Plasma Mobile environment." },
    ],
    "kde-workspaces": [
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "development-tools", name: "Development Tools", description: "Compilers, debuggers, and build utilities for software development." },
        { id: "office-suite", name: "Office Suite and Productivity", description: "Applications for documents, spreadsheets, and presentations." },
    ],
    "xfce-desktop": [
        { id: "networkmanager", name: "Common NetworkManager Submodules", description: "This group contains NetworkManager submodules that are commonly used, but may not be wanted in some streamlined configurations." },
        { id: "development-tools", name: "Development Tools", description: "Compilers, debuggers, and build utilities for software development." },
    ],
};

const generalAddOns = [
    { id: "3d-printing", name: "3D Printing", description: "3D printing software." },
    { id: "audio-production", name: "Audio Production", description: "Various tools for audio synthesis and music production." },
    { id: "authoring", name: "Authoring and Publishing", description: "These tools allow you to create documents in the DocBook format and convert them into HTML, PDF, Postscript, and text." },
];

const SearchSelect = ({ ariaLabel, placeholder, items, groups, selected, onSelect, isMulti = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const matchesFilter = item => `${item.name} ${item.description}`.toLowerCase().includes(filter.toLowerCase());
    const clearSearch = () => setFilter("");
    const selectedLabel = !isMulti && items.find(item => item.id === selected)?.name;
    const renderOption = item => <SelectOption key={item.id} value={item.id} description={item.description} isSelected={isMulti ? selected.includes(item.id) : selected === item.id}>{item.name}</SelectOption>;
    const toggle = toggleRef => <div className="content-select-toggle">
        <SearchIcon aria-hidden="true" />
        <TextInput
            ref={toggleRef}
            aria-label={ariaLabel}
            value={filter}
            placeholder={selectedLabel || placeholder}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onChange={(_, value) => { setFilter(value); setIsOpen(true); }}
        />
        {filter && <Button variant="plain" aria-label="Clear search" onClick={clearSearch}><TimesIcon /></Button>}
    </div>;
    return <Select
        className="content-select"
        variant="typeahead"
        isOpen={isOpen}
        selected={selected}
        onOpenChange={setIsOpen}
        onSelect={(_, value) => {
            onSelect(value);
            setFilter("");
            if (!isMulti) setIsOpen(false);
        }}
        toggle={toggle}
        shouldFocusToggleOnSelect={false}
        maxMenuHeight="280px"
        isScrollable
    >
        {groups ? groups.map(group => {
            const matches = group.items.filter(matchesFilter);
            return matches.length ? <SelectGroup key={group.label} label={group.label}>{matches.map(renderOption)}</SelectGroup> : null;
        }) : items.filter(matchesFilter).map(renderOption)}
    </Select>;
};

const EnvironmentSelect = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedName = environments.find(item => item.id === selected)?.name;
    return <Select
        className="environment-select"
        isOpen={isOpen}
        selected={selected}
        onOpenChange={setIsOpen}
        onSelect={(_, value) => { onSelect(value); setIsOpen(false); }}
        toggle={toggleRef => <button ref={toggleRef} type="button" className="environment-select-toggle" aria-label="Select environment" aria-expanded={isOpen} onClick={() => setIsOpen(current => !current)}>
            <span>{selectedName || "Select environment"}</span><AngleDownIcon aria-hidden="true" />
        </button>}
        isScrollable
        maxMenuHeight="320px"
    >
        {environments.map(item => <SelectOption key={item.id} value={item.id} description={item.description} isSelected={selected === item.id}>{item.name}</SelectOption>)}
    </Select>;
};

const SoftwareHeader = ({ concept }) => <>
    <Title headingLevel="h1" size="2xl" id="software-content-title">Software selection</Title>
    <p className="software-description">{concept}</p>
</>;

const BaseEnvironmentSection = ({ environment, onEnvironmentChange, children }) => <section className="software-section" aria-labelledby="base-environment-title">
    <Title headingLevel="h2" size="xl" id="base-environment-title">Base environment</Title>
    <p>{environment && environment !== "none" ? "Change the environment to explore the add-ons available for it." : "Select an environment to see its available add-ons."}</p>
    <FormGroup label="Select environment" fieldId="base-environment-select">
        <EnvironmentSelect selected={environment} onSelect={onEnvironmentChange} />
    </FormGroup>
    {children}
</section>;

const SoftwareContent = ({ environment, selectedAddOns, onEnvironmentChange, onToggleAddOn, onAddRecommended }) => {
    const [expandedGroups, setExpandedGroups] = useState({ specific: true, general: true });
    const specificAddOns = getEnvironmentAddOns(environment);
    const addOns = [...specificAddOns, ...generalAddOns];
    const environmentName = getEnvironmentName(environment);
    const recommendations = specificAddOns.map(item => item.id);
    const allRecommendedSelected = recommendations.every(id => selectedAddOns.includes(id));
    const toggleAddOn = onToggleAddOn;
    const addRecommended = () => onAddRecommended(recommendations);
    const selectedSpecific = specificAddOns.filter(item => selectedAddOns.includes(item.id));
    const selectedGeneral = generalAddOns.filter(item => selectedAddOns.includes(item.id));
    const renderTreeGroup = (key, label, items, position) => {
        if (!items.length) return null;
        const parentProps = { "aria-level": 1, "aria-posinset": position, "aria-setsize": items.length, isExpanded: expandedGroups[key], toggleAriaLabel: `${expandedGroups[key] ? "Collapse" : "Expand"} ${label}` };
        return <React.Fragment key={key}>
            <TreeRowWrapper row={{ props: parentProps }} className="software-tree-parent">
                <Td treeRow={{ rowIndex: position, props: parentProps, onCollapse: () => setExpandedGroups(current => ({ ...current, [key]: !current[key] })) }}>
                    <strong>{label}</strong><span className="software-tree-count">{items.length} selected</span>
                </Td>
                <Td />
            </TreeRowWrapper>
            {items.map((item, index) => {
                const childProps = { "aria-level": 2, "aria-posinset": index + 1, "aria-setsize": 0, isHidden: !expandedGroups[key] };
                return <TreeRowWrapper key={item.id} row={{ props: childProps }}>
                    <Td treeRow={{ rowIndex: index + 1, props: childProps, onCollapse: () => {} }} dataLabel="Name"><strong>{item.name}</strong><p>{item.description}</p></Td>
                    <Td isActionCell><Button variant="plain" icon={<MinusCircleIcon />} aria-label={`Remove ${item.name}`} onClick={() => toggleAddOn(item.id)} /></Td>
                </TreeRowWrapper>;
            })}
        </React.Fragment>;
    };
    return <section className="software-content" aria-labelledby="software-content-title">
        <SoftwareHeader concept="Concept 1 · Grouped menu and tree table. Choose a base environment, then add software." />
        <BaseEnvironmentSection environment={environment} onEnvironmentChange={onEnvironmentChange} />
        <section className="software-section additional-software" aria-labelledby="additional-software-title">
            <Title headingLevel="h2" size="xl" id="additional-software-title">Additional software</Title>
            <p>{environmentName ? `Choose add-ons for ${environmentName}. Recommended options appear first.` : "Choose optional add-ons available for any environment."}</p>
            {environmentName && <Alert variant="custom" customIcon={<RhUiCubesIcon />} isInline isExpandable component="h3" className="software-recommendations" title={`Recommended add-ons for ${environmentName}`} toggleAriaLabel={`Recommended add-ons for ${environmentName} details`}>
                <p>Choose the add-ons that fit this environment.</p>
                <div className="software-recommendation-list">
                    {specificAddOns.map(item => <div className="software-recommendation-item" key={item.id}>
                        <div><strong>{item.name}</strong><p>{item.description}</p></div>
                        <Button variant="link" icon={<PlusCircleIcon />} isDisabled={selectedAddOns.includes(item.id)} onClick={() => toggleAddOn(item.id)}>{selectedAddOns.includes(item.id) ? "Added" : "Add"}</Button>
                    </div>)}
                </div>
                <Button variant="link" isDisabled={allRecommendedSelected} onClick={addRecommended}>{allRecommendedSelected ? "All recommended add-ons added" : "Add all recommended"}</Button>
            </Alert>}
            <FormGroup label="Add-ons" fieldId="software-addon-select">
                <SearchSelect ariaLabel="Search and add software" placeholder="Search and add software" items={addOns} groups={environmentName ? [{ label: `For ${environmentName}`, items: specificAddOns }, { label: "Other add-ons", items: generalAddOns }] : [{ label: "Available add-ons", items: generalAddOns }]} selected={selectedAddOns} onSelect={toggleAddOn} isMulti />
            </FormGroup>
            <Table aria-label="Selected software add-ons" variant="compact" isTreeTable className="selected-software-table">
                <Thead><Tr><Th>Name</Th><Th screenReaderText="Actions" /></Tr></Thead>
                <Tbody>
                    {renderTreeGroup("specific", environmentName ? `For ${environmentName}` : "Environment add-ons", selectedSpecific, 1)}
                    {renderTreeGroup("general", "Other add-ons", selectedGeneral, 2)}
                    {!selectedSpecific.length && !selectedGeneral.length && <Tr><Td colSpan={2} className="empty-software-state">No additional software selected.</Td></Tr>}
                </Tbody>
            </Table>
        </section>
    </section>;
};

const AddOnChecklist = ({ items, selectedAddOns, onToggleAddOn, filter = "", idPrefix }) => {
    const visibleItems = items.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(filter.toLowerCase()));
    return <div className="software-checklist">
        {visibleItems.map(item => <Checkbox
            key={item.id}
            id={`${idPrefix}-${item.id}`}
            label={item.name}
            description={item.description}
            isChecked={selectedAddOns.includes(item.id)}
            onChange={() => onToggleAddOn(item.id)}
        />)}
        {!visibleItems.length && <p className="software-no-results">No matching add-ons.</p>}
    </div>;
};

const SelectedAddOnsSummary = ({ environment, selectedAddOns, onToggleAddOn, showCategory = false, showSelectedIcon = false }) => {
    const currentEnvironmentAddOns = getEnvironmentAddOns(environment);
    const items = [...currentEnvironmentAddOns, ...generalAddOns].filter(item => selectedAddOns.includes(item.id));
    const specificIds = new Set(currentEnvironmentAddOns.map(item => item.id));
    return <section className="software-selection-summary" aria-labelledby="selected-addons-title">
        <Title headingLevel={showCategory ? "h2" : "h3"} size={showCategory ? "xl" : "lg"} id="selected-addons-title">{showSelectedIcon && <RhUiCheckClipboardIcon className="software-heading-icon" aria-hidden="true" />}<span>Selected software ({items.length})</span></Title>
        <Table aria-label="Selected software add-ons" variant="compact" className="selected-software-table">
            <Thead><Tr><Th>Name</Th>{showCategory && <Th>Category</Th>}<Th screenReaderText="Actions" /></Tr></Thead>
            <Tbody>
                {items.map(item => <Tr key={item.id}>
                    <Td dataLabel="Name"><strong>{item.name}</strong><p>{item.description}</p></Td>
                    {showCategory && <Td dataLabel="Category">{specificIds.has(item.id) ? "Base environment" : "Additional software"}</Td>}
                    <Td isActionCell><Button variant="plain" icon={<MinusCircleIcon />} aria-label={`Remove ${item.name}`} onClick={() => onToggleAddOn(item.id)} /></Td>
                </Tr>)}
                {!items.length && <Tr><Td colSpan={showCategory ? 3 : 2} className="empty-software-state">No additional software selected.</Td></Tr>}
            </Tbody>
        </Table>
    </section>;
};

const EnvironmentAddOnsTable = ({ environmentName, items, selectedAddOns, onToggleAddOn, idPrefix }) => <div className="environment-table-scroll">
    <Table aria-label={`Add-ons for ${environmentName}`} variant="compact" className="environment-software-table">
        <Thead><Tr><Th>Add-on</Th><Th>Description</Th></Tr></Thead>
        <Tbody>
            {items.map(item => <Tr key={item.id}>
                <Td dataLabel="Add-on">
                    <Checkbox
                        id={`${idPrefix}-${item.id}`}
                        label={item.name}
                        isChecked={selectedAddOns.includes(item.id)}
                        onChange={() => onToggleAddOn(item.id)}
                    />
                </Td>
                <Td dataLabel="Description">{item.description}</Td>
            </Tr>)}
        </Tbody>
    </Table>
</div>;

const SoftwareCatalogColumns = ({ environment, selectedAddOns, onEnvironmentChange, onToggleAddOn }) => {
    const environmentName = getEnvironmentName(environment);
    const specificAddOns = getEnvironmentAddOns(environment);
    return <section className="software-content" aria-labelledby="software-content-title">
        <SoftwareHeader concept="Concept 2 · Preview software as you explore base environments, then choose any additional software." />
        <BaseEnvironmentSection environment={environment} onEnvironmentChange={onEnvironmentChange}>
            {environmentName && <Alert
                variant="custom"
                customIcon={<RhUiCubesIcon />}
                isInline
                isExpandable
                component="h3"
                className="environment-software-alert"
                title={`Add-ons for ${environmentName}`}
                toggleAriaLabel={`Add-ons for ${environmentName}`}
            >
                <p>Each row is one selectable add-on for this environment.</p>
                <EnvironmentAddOnsTable environmentName={environmentName} items={specificAddOns} selectedAddOns={selectedAddOns} onToggleAddOn={onToggleAddOn} idPrefix="preview-specific" />
            </Alert>}
        </BaseEnvironmentSection>
        <section className="software-section additional-software" aria-labelledby="additional-software-title">
            <Title headingLevel="h2" size="xl" id="additional-software-title">Additional software</Title>
            <p>Search and add software by environment or from the full add-on catalog.</p>
            <FormGroup label="Add-ons" fieldId="preview-addon-select">
                <SearchSelect
                    ariaLabel="Search and add software"
                    placeholder="Search and add software"
                    items={[...specificAddOns, ...generalAddOns]}
                    groups={environmentName ? [{ label: `For ${environmentName}`, items: specificAddOns }, { label: "Other add-ons", items: generalAddOns }] : [{ label: "Available add-ons", items: generalAddOns }]}
                    selected={selectedAddOns}
                    onSelect={onToggleAddOn}
                    isMulti
                />
            </FormGroup>
        </section>
        <SelectedAddOnsSummary environment={environment} selectedAddOns={selectedAddOns} onToggleAddOn={onToggleAddOn} showCategory />
    </section>;
};

const SoftwareCatalogTable = ({ environment, selectedAddOns, onEnvironmentChange, onToggleAddOn }) => {
    const environmentName = getEnvironmentName(environment);
    const specificAddOns = getEnvironmentAddOns(environment);
    return <section className="software-content software-table-concept" aria-labelledby="software-content-title">
        <SoftwareHeader concept="Concept 4 · Compare environment-specific add-ons in a table before choosing." />
        <BaseEnvironmentSection environment={environment} onEnvironmentChange={onEnvironmentChange}>
            {environmentName && <div className="environment-table-section" aria-live="polite">
                <Title headingLevel="h3" size="lg" className="environment-table-title"><RhUiCubesIcon aria-hidden="true" /><span>Add-ons for {environmentName}</span></Title>
                <p>Each row is one selectable add-on for this environment.</p>
                <EnvironmentAddOnsTable environmentName={environmentName} items={specificAddOns} selectedAddOns={selectedAddOns} onToggleAddOn={onToggleAddOn} idPrefix="table-specific" />
            </div>}
        </BaseEnvironmentSection>
        <section className="software-section additional-software" aria-labelledby="additional-software-title">
            <Title headingLevel="h2" size="xl" id="additional-software-title">Additional software</Title>
            <p>Optional add-ons available with any base environment.</p>
            <FormGroup label="Add-ons" fieldId="table-addon-select">
                <SearchSelect ariaLabel="Search and add software" placeholder="Search and add software" items={generalAddOns} selected={selectedAddOns} onSelect={onToggleAddOn} isMulti />
            </FormGroup>
        </section>
        <SelectedAddOnsSummary environment={environment} selectedAddOns={selectedAddOns} onToggleAddOn={onToggleAddOn} showCategory showSelectedIcon />
    </section>;
};

const SoftwareCatalogTabs = ({ environment, selectedAddOns, onEnvironmentChange, onToggleAddOn, onAddRecommended }) => {
    const [activeCategory, setActiveCategory] = useState("environment");
    const [filter, setFilter] = useState("");
    const environmentName = getEnvironmentName(environment);
    const specificAddOns = getEnvironmentAddOns(environment);
    const allRecommendedSelected = specificAddOns.every(item => selectedAddOns.includes(item.id));
    const showCategory = (key, items, idPrefix) => <div className="software-tab-content">
        <SearchInput aria-label={`Search ${key === "environment" ? environmentName : "other"} add-ons`} placeholder="Search add-ons" value={filter} onChange={(_, value) => setFilter(value)} onClear={() => setFilter("")} />
        {key === "environment" && !environmentName ? <p>Select a base environment to see its add-ons.</p> : <AddOnChecklist items={items} selectedAddOns={selectedAddOns} onToggleAddOn={onToggleAddOn} filter={filter} idPrefix={idPrefix} />}
        {key === "environment" && <Button variant="link" isDisabled={allRecommendedSelected} onClick={() => onAddRecommended(specificAddOns.map(item => item.id))}>{allRecommendedSelected ? "All selected" : "Select all for this environment"}</Button>}
    </div>;
    return <section className="software-content" aria-labelledby="software-content-title">
        <SoftwareHeader concept="Concept 3 · Focus on one add-on category at a time with tabs." />
        <BaseEnvironmentSection environment={environment} onEnvironmentChange={onEnvironmentChange} />
        <section className="software-section additional-software" aria-labelledby="additional-software-title">
            <Title headingLevel="h2" size="xl" id="additional-software-title">Additional software</Title>
            <p>Switch categories to browse and select add-ons. Selections stay marked in each list.</p>
            <Tabs activeKey={activeCategory} onSelect={(_, key) => { setActiveCategory(key); setFilter(""); }} tabListAriaLabel="Add-on categories" className="software-category-tabs">
        <Tab eventKey="environment" title={<TabTitleText>{environmentName ? `For ${environmentName}` : "Choose an environment"}</TabTitleText>}>{environmentName ? showCategory("environment", specificAddOns, "tab-specific") : <p>Select a base environment to see its add-ons.</p>}</Tab>
                <Tab eventKey="other" title={<TabTitleText>Other add-ons</TabTitleText>}>{showCategory("other", generalAddOns, "tab-general")}</Tab>
            </Tabs>
        </section>
    </section>;
};

function App() {
    const [theme, setTheme] = useState("light");
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [installationMode, setInstallationMode] = useState("package");
    const [softwareEnvironment, setSoftwareEnvironment] = useState("");
    const [selectedSoftwareAddOns, setSelectedSoftwareAddOns] = useState([]);
    const changeSoftwareEnvironment = id => setSoftwareEnvironment(id);
    const toggleSoftwareAddOn = id => setSelectedSoftwareAddOns(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    const addRecommendedSoftware = ids => setSelectedSoftwareAddOns(current => [...new Set([...current, ...ids])]);
    const softwareProps = {
        environment: softwareEnvironment,
        selectedAddOns: selectedSoftwareAddOns.filter(id => generalAddOns.some(item => item.id === id) || getEnvironmentAddOns(softwareEnvironment).some(item => item.id === id)),
        onEnvironmentChange: changeSoftwareEnvironment,
        onToggleAddOn: toggleSoftwareAddOn,
        onAddRecommended: addRecommendedSoftware,
    };
    useEffect(() => {
        document.documentElement.classList.toggle("pf-v6-theme-dark", theme === "dark");
        return () => document.documentElement.classList.remove("pf-v6-theme-dark");
    }, [theme]);
    const showOpeningPage = () => {
        setStarted(false);
        setFinished(false);
        setCompletedSteps([]);
    };
    const steps = stepContent.map(({ name, description }, index) => index === 5 ? <WizardStep
        key={name}
        id="setup-step-6"
        name={name}
        status={completedSteps.includes("setup-step-6") ? "success" : "default"}
        steps={[
            <WizardStep key="grouped" id="setup-step-6-grouped" name="A. Grouped menu"><SoftwareContent {...softwareProps} /></WizardStep>,
            <WizardStep key="columns" id="setup-step-6-columns" name="B. Environment preview"><SoftwareCatalogColumns {...softwareProps} /></WizardStep>,
            <WizardStep key="tabs" id="setup-step-6-tabs" name="C. Category tabs"><SoftwareCatalogTabs {...softwareProps} /></WizardStep>,
            <WizardStep key="table" id="setup-step-6-table" name="D. Software table"><SoftwareCatalogTable {...softwareProps} /></WizardStep>,
        ]}
    /> : <WizardStep
        key={name}
        id={`setup-step-${index + 1}`}
        name={name}
        status={completedSteps.includes(`setup-step-${index + 1}`) ? "success" : "default"}
        footer={{ nextButtonText: index === stepContent.length - 1 ? "Finish" : "Next" }}
    >
        {index === 4 ? <InstallationContent mode={installationMode} setMode={setInstallationMode} /> : <section className="step-content" aria-labelledby={`setup-step-${index + 1}-title`}>
            <Title headingLevel="h1" size="2xl" id={`setup-step-${index + 1}-title`}>{name}</Title>
            <p>{description}</p>
        </section>}
    </WizardStep>);

    return <main className={`setup-backdrop theme-${theme}`}>
        {!started ? <section className="welcome-card" aria-labelledby="welcome-title">
            <div className="brand-mark" aria-hidden="true"><RedhatIcon /></div>
            <p className="eyebrow">RED HAT ENTERPRISE LINUX</p>
            <h1 id="welcome-title">Welcome</h1>
            <p className="welcome-copy">Let’s get your system ready. This guided setup will help you configure the essentials before installation.</p>
            <div className="appearance-selector">
                <span>Appearance</span>
                <AppearanceSwitch theme={theme} setTheme={setTheme} />
            </div>
            <div className="welcome-actions">
                <Button variant="primary" icon={<ArrowRightIcon />} iconPosition="end" onClick={() => setStarted(true)}>Install RHEL</Button>
                <Button variant="secondary" onClick={() => setStarted(false)}>Cancel</Button>
            </div>
        </section> : finished ? <section className="welcome-card completion-card">
            <div className="brand-mark completion-mark" aria-hidden="true">✓</div>
            <h1>Setup complete</h1>
            <p className="welcome-copy">You’ve reached the end of the setup wizard.</p>
            <Button variant="primary" onClick={showOpeningPage}>Return to opening page</Button>
        </section> : <div className="wizard-frame">
            <header className="wizard-brand">
                <span className="mini-mark" aria-hidden="true"><RedhatIcon /></span>
                <span>Red Hat Enterprise Linux setup</span>
                <ThemeToggle theme={theme} setTheme={setTheme} isCompact />
                <Button variant="link" onClick={showOpeningPage}>Opening page</Button>
            </header>
            <Wizard
                className="setup-wizard"
                navAriaLabel="Setup steps"
                onSave={() => {
                    setCompletedSteps(stepContent.map((_, index) => `setup-step-${index + 1}`));
                    setFinished(true);
                }}
                onClose={showOpeningPage}
                onStepChange={(event, currentStep, previousStep) => {
                    if (currentStep.index > previousStep.index) {
                        setCompletedSteps(previous => {
                            const completedIds = previousStep.parentId ? [] : [previousStep.id];
                            if (previousStep.parentId === "setup-step-6" && currentStep.id === "setup-step-7") completedIds.push("setup-step-6");
                            return [...new Set([...previous, ...completedIds])];
                        });
                    }
                }}
            >{steps}</Wizard>
        </div>}
    </main>;
}

createRoot(document.getElementById("app")).render(<App />);

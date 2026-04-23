export default function ScriptTag() {
	const snippet = `<script crossorigin src="${window.location.origin}/connect"></script>`;
	return <code class="font-mono text-base-content">{snippet}</code>;
}
